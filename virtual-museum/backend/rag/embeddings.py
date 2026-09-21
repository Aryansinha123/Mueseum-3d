"""
Artifact Embedding Pipeline (Phase 1 RAG Core)

This module is responsible for:
1. Loading museum artifact metadata from backend/data/artifacts.json.
2. Constructing semantic corpus text for each artifact (Name + Gallery + Description + Historical Context).
3. Loading the 'all-MiniLM-L6-v2' SentenceTransformer model.
4. Generating and caching artifact vector embeddings as an in-memory NumPy array.
"""

import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer

# Default model used for semantic text embedding
MODEL_NAME = "all-MiniLM-L6-v2"


class ArtifactEmbeddingManager:
    """
    Manages loading of artifact metadata and generation/caching of vector embeddings.
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
        self.cache_path = os.path.join(os.path.dirname(data_path), "artifact_embeddings.npy")
        self.model_name = model_name
        self.model = None
        self.artifacts = []
        self.embeddings = None

        # Load artifact dataset and initialize embeddings
        self.load_artifacts()
        self.initialize_embeddings()

    def load_artifacts(self):
        """Loads artifact metadata from the JSON file."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Artifacts data file not found at: {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.artifacts = json.load(f)

        print(f"[EmbeddingManager] Loaded {len(self.artifacts)} artifacts from {self.data_path}")

    def build_corpus_text(self, artifact: dict) -> str:
        """
        Constructs clean semantic text representation for an artifact.
        
        Only includes human-understandable knowledge:
        - Artifact Name
        - Gallery Name
        - Category & Institution
        - Main Description
        - Historical Significance
        
        Excludes technical fields (e.g., GLB paths, IDs, 3D coordinates).
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
        Generates embeddings for all loaded artifacts.
        Uses a local .npy cache if valid, otherwise computes and saves embeddings.
        """
        # Check if cache exists and is newer than artifacts.json
        if os.path.exists(self.cache_path) and os.path.exists(self.data_path):
            json_mtime = os.path.getmtime(self.data_path)
            cache_mtime = os.path.getmtime(self.cache_path)

            if cache_mtime > json_mtime:
                try:
                    self.embeddings = np.load(self.cache_path)
                    if self.embeddings.shape[0] == len(self.artifacts):
                        print(f"[EmbeddingManager] Loaded cached embeddings from {self.cache_path} (Shape: {self.embeddings.shape})")
                        return
                except Exception as e:
                    print(f"[EmbeddingManager] Warning: Failed to load cache ({e}). Re-generating...")

        # Compute embeddings from scratch
        print("[EmbeddingManager] Generating fresh embeddings for artifacts...")
        corpus_list = [self.build_corpus_text(art) for art in self.artifacts]
        model = self._get_model()
        
        # Encode all texts into a 2D NumPy array (N x D)
        embeddings_matrix = model.encode(corpus_list, convert_to_numpy=True, show_progress_bar=False)
        self.embeddings = np.array(embeddings_matrix, dtype=np.float32)

        # Save to local cache
        try:
            np.save(self.cache_path, self.embeddings)
            print(f"[EmbeddingManager] Saved embeddings to cache: {self.cache_path}")
        except Exception as e:
            print(f"[EmbeddingManager] Warning: Could not save embedding cache ({e})")

    def encode_query(self, query_text: str) -> np.ndarray:
        """
        Encodes a single user text question into a vector embedding.
        
        :param query_text: User question string
        :return: 1D NumPy array representing query vector
        """
        model = self._get_model()
        query_vector = model.encode([query_text], convert_to_numpy=True, show_progress_bar=False)[0]
        return np.array(query_vector, dtype=np.float32)
