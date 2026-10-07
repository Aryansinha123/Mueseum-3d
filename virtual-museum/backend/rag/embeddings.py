import os
import re
import json
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer

# Default model used for semantic text embedding
MODEL_NAME = "all-MiniLM-L6-v2"


def split_text_into_sentences(text: str) -> List[str]:
    """
    Splits a block of text into distinct sentences using standard punctuation terminators.
    Handles abbreviations cleanly.
    """
    if not text or not isinstance(text, str):
        return []
    clean = re.sub(r'[\r\n]+', ' ', text).strip()
    if not clean:
        return []
    # Split on sentence boundaries: period, exclamation, or question mark followed by space and capital letter or quote
    raw = re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'“‘])', clean)
    return [s.strip() for s in raw if s.strip()]


def group_sentences_into_chunks(sentences: List[str], max_sentences: int = 3) -> List[str]:
    """
    Groups individual sentences into pieces of 2 to 3 sentences each.
    """
    if not sentences:
        return []
    if len(sentences) <= max_sentences:
        return [" ".join(sentences)]

    chunks = []
    for i in range(0, len(sentences), max_sentences):
        batch = sentences[i:i + max_sentences]
        if batch:
            chunks.append(" ".join(batch))
    return chunks


def build_artifact_chunks(artifact: dict, max_sentences_per_chunk: int = 3) -> List[Dict[str, Any]]:
    """
    Decomposes an artifact's long descriptions, physical specifications, and curated knowledge
    into focused 2-3 sentence pieces instead of a single monolithic blob.
    
    Each chunk is anchored with the artifact's name and category to ensure high-precision
    vector retrieval without losing exhibit context.
    """
    chunks = []
    art_id = artifact.get("id", "UNKNOWN")
    name = artifact.get("name") or artifact.get("title", "Unknown Artifact")
    gallery = artifact.get("galleryName") or artifact.get("gallery", "Museum Collection")
    category = artifact.get("category", "")
    anchor_prefix = f"{name} ({category})".strip()

    def _add_chunks(text: str, section_label: str):
        if not text or not isinstance(text, str):
            return
        sentences = split_text_into_sentences(text)
        if not sentences:
            return
        chunk_pieces = group_sentences_into_chunks(sentences, max_sentences=max_sentences_per_chunk)
        for piece in chunk_pieces:
            embed_text = f"{anchor_prefix} — {section_label}: {piece}"
            chunks.append({
                "chunk_id": f"{art_id}_c{len(chunks)}",
                "artifact_id": art_id,
                "artifact_name": name,
                "gallery": gallery,
                "category": category,
                "section": section_label,
                "text": piece,
                "embed_text": embed_text,
            })

    # 1. Main Description (chunked into 2-3 sentences)
    _add_chunks(artifact.get("description", ""), section_label="Overview & Description")

    # 2. Physical Specifications & Historical Significance (aiContext)
    ai_ctx = artifact.get("aiContext", {})
    if isinstance(ai_ctx, dict):
        ctx_parts = []
        if ai_ctx.get("historicalSignificance"):
            ctx_parts.append(ai_ctx["historicalSignificance"])
        if ai_ctx.get("material"):
            ctx_parts.append(f"Crafted from {ai_ctx['material']}.")
        if ai_ctx.get("dimensions"):
            ctx_parts.append(f"Recorded physical dimensions are {ai_ctx['dimensions']}.")
        if ctx_parts:
            _add_chunks(" ".join(ctx_parts), section_label="Materials & Significance")

    # 3. Curated Extended Knowledge Sections (2-3 sentences each)
    ext = artifact.get("extended_knowledge", {})
    if isinstance(ext, dict):
        for sec_key, sec_text in ext.items():
            if isinstance(sec_text, str) and sec_text.strip():
                _add_chunks(sec_text, section_label=sec_key.replace("_", " ").title())

    return chunks


class ArtifactEmbeddingManager:
    """
    Manages loading of artifact metadata, generation of 2-3 sentence semantic chunks,
    and caching of chunk-level vector embeddings for high-precision retrieval.
    """

    def __init__(self, data_path: str = None, model_name: str = MODEL_NAME):
        """
        Initialize the embedding manager.
        
        :param data_path: Absolute or relative path to artifacts.json dataset
        :param model_name: SentenceTransformer model identifier
        """
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, "data", "artifacts.json")

        self.data_path = data_path
        self.cache_dir = os.path.dirname(data_path)
        self.cache_path = os.path.join(self.cache_dir, "artifact_embeddings.npy")
        self.chunk_cache_path = os.path.join(self.cache_dir, "chunk_embeddings.npy")
        self.chunk_meta_path = os.path.join(self.cache_dir, "chunk_meta.json")

        self.model_name = model_name
        self.model = None
        self.artifacts: List[Dict[str, Any]] = []
        self._artifact_by_id: Dict[str, Dict[str, Any]] = {}
        
        # 2-3 Sentence Chunks & Embeddings
        self.chunks: List[Dict[str, Any]] = []
        self.chunk_embeddings: Optional[np.ndarray] = None
        
        # Artifact-level embedding matrix (maintained for backwards compatibility)
        self.embeddings: Optional[np.ndarray] = None

        # Load artifact dataset and initialize embeddings
        self.load_artifacts()
        self.initialize_embeddings()

    def load_artifacts(self):
        """Loads artifact metadata from the JSON file and constructs 2-3 sentence chunks."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Artifacts data file not found at: {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.artifacts = json.load(f)

        self._artifact_by_id = {a["id"]: a for a in self.artifacts if "id" in a}

        # Build 2-3 sentence semantic chunks for each artifact
        self.chunks = []
        for art in self.artifacts:
            art_chunks = build_artifact_chunks(art, max_sentences_per_chunk=3)
            self.chunks.extend(art_chunks)

        print(f"[EmbeddingManager] Loaded {len(self.artifacts)} artifacts from {self.data_path}")
        print(f"[EmbeddingManager] Generated {len(self.chunks)} precise 2-3 sentence chunks across all exhibits")

    def get_artifact_by_id(self, artifact_id: str) -> Optional[Dict[str, Any]]:
        """Fast dictionary lookup of artifact metadata by ID."""
        return self._artifact_by_id.get(artifact_id)

    def get_artifact_chunk_indices(self, artifact_id: str) -> List[int]:
        """Returns indices of all chunks belonging to a specific artifact."""
        return [i for i, c in enumerate(self.chunks) if c["artifact_id"] == artifact_id]

    def build_corpus_text(self, artifact: dict) -> str:
        """
        Constructs clean semantic text representation for an artifact overview.
        """
        name = artifact.get("name", "")
        gallery = artifact.get("galleryName", "")
        category = artifact.get("category", "")
        description = artifact.get("description", "")
        
        ai_context = artifact.get("aiContext", {})
        significance = ai_context.get("historicalSignificance", "") if isinstance(ai_context, dict) else ""

        corpus_text = f"{name}. Gallery: {gallery}. Category: {category}. {description}"
        if significance:
            corpus_text += f" Historical Context: {significance}"

        return corpus_text

    def _get_model(self) -> SentenceTransformer:
        """Loads the SentenceTransformer model lazily to optimize startup."""
        if self.model is None:
            print(f"[EmbeddingManager] Loading SentenceTransformer model '{self.model_name}'...")
            self.model = SentenceTransformer(self.model_name)
        return self.model

    def initialize_embeddings(self):
        """
        Generates embeddings for both the 2-3 sentence chunks and artifact overviews.
        Uses cached .npy matrices if valid, otherwise computes and caches them.
        """
        json_mtime = os.path.getmtime(self.data_path) if os.path.exists(self.data_path) else 0

        # ── 1. CHUNK EMBEDDINGS (High Precision) ──────────────────────────────
        chunks_loaded = False
        if os.path.exists(self.chunk_cache_path):
            chunk_cache_mtime = os.path.getmtime(self.chunk_cache_path)
            if chunk_cache_mtime > json_mtime:
                try:
                    loaded_chunks = np.load(self.chunk_cache_path)
                    if loaded_chunks.shape[0] == len(self.chunks):
                        self.chunk_embeddings = loaded_chunks
                        print(f"[EmbeddingManager] Loaded cached chunk embeddings (Shape: {self.chunk_embeddings.shape})")
                        chunks_loaded = True
                except Exception as e:
                    print(f"[EmbeddingManager] Warning: Failed to load chunk cache ({e}). Re-generating...")

        if not chunks_loaded:
            print(f"[EmbeddingManager] Encoding {len(self.chunks)} precise 2-3 sentence chunks...")
            model = self._get_model()
            chunk_texts = [c["embed_text"] for c in self.chunks]
            chunk_matrix = model.encode(chunk_texts, convert_to_numpy=True, show_progress_bar=False)
            self.chunk_embeddings = np.array(chunk_matrix, dtype=np.float32)

            try:
                np.save(self.chunk_cache_path, self.chunk_embeddings)
                print(f"[EmbeddingManager] Saved chunk embeddings to cache: {self.chunk_cache_path}")
            except Exception as e:
                print(f"[EmbeddingManager] Warning: Could not save chunk embedding cache ({e})")

        # ── 2. ARTIFACT-LEVEL EMBEDDINGS (Backward Compatibility) ───────────────
        artifacts_loaded = False
        if os.path.exists(self.cache_path):
            cache_mtime = os.path.getmtime(self.cache_path)
            if cache_mtime > json_mtime:
                try:
                    loaded_arts = np.load(self.cache_path)
                    if loaded_arts.shape[0] == len(self.artifacts):
                        self.embeddings = loaded_arts
                        print(f"[EmbeddingManager] Loaded cached artifact embeddings (Shape: {self.embeddings.shape})")
                        artifacts_loaded = True
                except Exception as e:
                    print(f"[EmbeddingManager] Warning: Failed to load artifact cache ({e}). Re-generating...")

        if not artifacts_loaded:
            print("[EmbeddingManager] Generating fresh artifact overview embeddings...")
            corpus_list = [self.build_corpus_text(art) for art in self.artifacts]
            model = self._get_model()
            embeddings_matrix = model.encode(corpus_list, convert_to_numpy=True, show_progress_bar=False)
            self.embeddings = np.array(embeddings_matrix, dtype=np.float32)

            try:
                np.save(self.cache_path, self.embeddings)
                print(f"[EmbeddingManager] Saved artifact embeddings to cache: {self.cache_path}")
            except Exception as e:
                print(f"[EmbeddingManager] Warning: Could not save artifact embedding cache ({e})")

    def encode_query(self, query_text: str) -> np.ndarray:
        """
        Encodes a visitor's question into a 1D vector embedding.
        
        :param query_text: User question string
        :return: 1D NumPy array representing query vector
        """
        model = self._get_model()
        query_vector = model.encode([query_text], convert_to_numpy=True, show_progress_bar=False)[0]
        return np.array(query_vector, dtype=np.float32)
