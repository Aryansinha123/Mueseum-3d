"""
Realistic Benchmark Generator for Virtual Museum Research Evaluation.

Generates 270 natural, human-written queries without template-name leakage:
1. 120 In-Scope Queries (8 per artifact: 4 descriptive without title, 2 specific curatorial attributes, 2 natural queries)
2. 90 Realistic Deictic Queries (6 varied conversational inquiries per artifact while inspecting in 3D)
3. 25 Distant Out-of-Domain Queries (coding, weather, pop culture, math)
4. 25 Hard Near-Domain Out-of-Catalog Queries (famous world museum artifacts NOT in this 15-artifact gallery)
5. 10 Ambiguous / Boundary Queries (short, vague, cross-exhibit)
"""
import os
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(ROOT, "research")
OUT_FILE = os.path.join(RESEARCH, "benchmark_realistic.json")

# Ground truth realistic queries per artifact
REALISTIC_IN_SCOPE = {
    "ART001": [
        ("Tell me about the marble sculpture of an indigenous craftsman weaving arrows.", "descriptive"),
        ("Which artwork was sculpted by a 19th-century Black and Native American woman artist?", "descriptive"),
        ("Show me the neoclassical marble statue depicting characters from Longfellow's Hiawatha.", "descriptive"),
        ("What is that stone carving showing a father and daughter sitting together making hunting gear?", "descriptive"),
        ("Who was Edmonia Lewis and what work does she have here?", "attribute"),
        ("What material was used to carve the Old Arrow Maker?", "attribute"),
        ("Tell me the story behind the Old Arrow Maker statue.", "natural"),
        ("What is the historical significance of the Old Arrow Maker sculpture?", "natural"),
    ],
    "ART002": [
        ("Which statue depicts the first American president dressed like a Roman god?", "descriptive"),
        ("Tell me about the controversial marble sculpture showing a shirtless founding father.", "descriptive"),
        ("Show me the monumental neoclassical carving inspired by the Olympian Zeus.", "descriptive"),
        ("What is that enormous marble figure of George Washington seated on an ornate throne?", "descriptive"),
        ("Who was Horatio Greenough and why was his statue of Washington criticized?", "attribute"),
        ("When was the monumental seated George Washington carved?", "attribute"),
        ("Tell me about Horatio Greenough's George Washington.", "natural"),
        ("What is the history behind the neoclassical George Washington statue?", "natural"),
    ],
    "ART003": [
        ("What is that antique brass switch used to tap out electrical code messages?", "descriptive"),
        ("Show me the device that sent the famous message What hath God wrought.", "descriptive"),
        ("Which instrument was used in the first official telecommunication line between Washington and Baltimore?", "descriptive"),
        ("Tell me about the 1844 brass instrument that revolutionized long-distance communication.", "descriptive"),
        ("Who invented the telegraph key on display in the historical gallery?", "attribute"),
        ("What was the very first telegraph message sent with the Morse key?", "attribute"),
        ("Tell me about the Morse-Vail telegraph key.", "natural"),
        ("How did the 1844 Morse telegraph transmitter work?", "natural"),
    ],
    "ART004": [
        ("What is that early electromagnetic apparatus with copper coils and an iron core?", "descriptive"),
        ("Show me the 1838 device that generated high voltage sparks using electromagnetic induction.", "descriptive"),
        ("Which antique scientific device served as the forerunner to modern electrical transformers?", "descriptive"),
        ("Tell me about the apparatus invented by Charles Grafton Page to boost electrical current.", "descriptive"),
        ("What was Charles Grafton Page's induction coil used for?", "attribute"),
        ("How did early scientists produce high-voltage sparks in 1838?", "attribute"),
        ("Tell me about the Page induction coil.", "natural"),
        ("What is the scientific significance of the Page induction device?", "natural"),
    ],
    "ART005": [
        ("What is that ancient Chinese bronze container shaped like an elephant?", "descriptive"),
        ("Show me the Shang dynasty ritual bronze wine vessel with animal carvings.", "descriptive"),
        ("Which exhibit is an ancient Asian cast bronze object used for ancestral ceremonies?", "descriptive"),
        ("Tell me about the covered bronze animal vessel from late Bronze Age China.", "descriptive"),
        ("What dynasty created the ceremonial elephant vessel?", "attribute"),
        ("What kind of rituals was the bronze elephant zun used for in ancient China?", "attribute"),
        ("Tell me about the Ceremonial Elephant-Shaped Covered Vessel.", "natural"),
        ("What motifs and decorations are cast onto the bronze elephant vessel?", "natural"),
    ],
    "ART006": [
        ("Show me the spacecraft that carried the first astronauts back from the Moon landing.", "descriptive"),
        ("What is that cone-shaped capsule that splashed down in the Pacific Ocean after Apollo 11?", "descriptive"),
        ("Which exhibit was the actual crew cabin for Armstrong, Aldrin, and Collins?", "descriptive"),
        ("Tell me about the heat-shielded command cabin from the historic 1969 lunar voyage.", "descriptive"),
        ("Who were the astronauts aboard Apollo 11 Columbia?", "attribute"),
        ("What happened to the Columbia capsule after it re-entered Earth's atmosphere?", "attribute"),
        ("Tell me about the Apollo 11 Command Module Columbia.", "natural"),
        ("What is the historical importance of the Apollo 11 command ship?", "natural"),
    ],
    "ART007": [
        ("Show me the reusable NASA orbiter that deployed the Hubble Space Telescope.", "descriptive"),
        ("What is the winged spacecraft on display that completed thirty-nine orbital missions?", "descriptive"),
        ("Which NASA space plane flew John Glenn back into orbit in 1998?", "descriptive"),
        ("Tell me about the veteran orbiter that spent a full year accumulated in Earth orbit.", "descriptive"),
        ("How many space missions did Space Shuttle Discovery complete?", "attribute"),
        ("When was Discovery retired from active NASA spaceflight service?", "attribute"),
        ("Tell me about the Space Shuttle Discovery.", "natural"),
        ("What major space telescopes and satellites were launched by Discovery?", "natural"),
    ],
    "ART008": [
        ("Which rocket plane was the first to fly faster than the speed of sound?", "descriptive"),
        ("Tell me about the bright orange aircraft flown by Chuck Yeager on October 14 1947.", "descriptive"),
        ("Show me the experimental bullet-shaped plane that broke Mach 1.", "descriptive"),
        ("What is the rocket-powered test aircraft named Glamorous Glennis?", "descriptive"),
        ("Who was the pilot that flew the Bell X-1 past the sound barrier?", "attribute"),
        ("How fast did the Bell X-1 fly on its historic supersonic flight?", "attribute"),
        ("Tell me about the Bell X-1 Glamorous Glennis.", "natural"),
        ("What engine powered the supersonic Bell X-1?", "natural"),
    ],
    "ART009": [
        ("Which exhibit was the silver protective garment worn by America's first astronauts?", "descriptive"),
        ("Show me the spacesuit used during Project Mercury orbital flights.", "descriptive"),
        ("What is that metallic pressure suit developed by Goodrich for early space explorers?", "descriptive"),
        ("Tell me about the flight suit designed to protect astronauts against vacuum in the early 1960s.", "descriptive"),
        ("What material gives the Mercury space suit its shiny silver exterior?", "attribute"),
        ("Who were the astronauts that wore the Mercury pressure suit?", "attribute"),
        ("Tell me about the Mercury Pressure Suit.", "natural"),
        ("How did the Mercury astronaut suit supply oxygen and maintain pressurization?", "natural"),
    ],
    "ART010": [
        ("Which robotic probe was the very first spacecraft to fly past the planet Jupiter?", "descriptive"),
        ("Show me the unmanned space explorer carrying a golden plaque for alien civilizations.", "descriptive"),
        ("What is that space probe that was first to safely traverse the asteroid belt in 1972?", "descriptive"),
        ("Tell me about the nuclear-powered deep space probe heading out of our solar system.", "descriptive"),
        ("What message is engraved on the Pioneer 10 golden plaque?", "attribute"),
        ("When did Pioneer 10 complete its historic flyby of Jupiter?", "attribute"),
        ("Tell me about the Pioneer 10 space probe.", "natural"),
        ("What power source kept Pioneer 10 transmitting across billions of miles?", "natural"),
    ],
    "ART011": [
        ("Tell me about the ancient fossil sea cow skeleton excavated in Qatar.", "descriptive"),
        ("What is that prehistoric sirenian skeleton from the Eocene epoch?", "descriptive"),
        ("Show me the extinct marine mammal fossil related to modern dugongs and manatees.", "descriptive"),
        ("Which exhibit contains the thirty-seven million year old aquatic mammal bones from the Persian Gulf?", "descriptive"),
        ("Where was the Salwasiren fossil discovery made?", "attribute"),
        ("How is Salwasiren related to present-day marine sirenians?", "attribute"),
        ("Tell me about the Salwasiren qatarensis fossil skeleton.", "natural"),
        ("What does the Salwasiren skeleton reveal about the evolution of ancient sea cows?", "natural"),
    ],
    "ART012": [
        ("Show me the massive carnivorous dinosaur skull with giant serrated teeth.", "descriptive"),
        ("What is that Cretaceous predator skull with the most powerful bite force in history?", "descriptive"),
        ("Where is the fossil head of the giant meat-eating theropod king?", "descriptive"),
        ("Tell me about the apex predatory dinosaur skull in the center of the hall.", "descriptive"),
        ("How strong was the bite force of a Tyrannosaurus rex?", "attribute"),
        ("What features made the T. rex skull adapted for crushing bone?", "attribute"),
        ("Tell me about the Tyrannosaurus rex skull on display.", "natural"),
        ("What period in prehistoric time did the Tyrannosaurus rex live?", "natural"),
    ],
    "ART013": [
        ("Show me the famous three-horned plant-eating dinosaur with the massive neck frill.", "descriptive"),
        ("What is that giant horned herbivore skeleton named Hatcher?", "descriptive"),
        ("Which exhibit is the world's first mounted skeleton of a ceratopsian dinosaur?", "descriptive"),
        ("Tell me about the horned dinosaur skull that used horns to defend against predators.", "descriptive"),
        ("Who was John Bell Hatcher and why is this Triceratops named after him?", "attribute"),
        ("What was the purpose of the large bony frill on the Triceratops skull?", "attribute"),
        ("Tell me about Triceratops horridus Hatcher.", "natural"),
        ("How did Triceratops defend itself against carnivorous dinosaurs like T. rex?", "natural"),
    ],
    "ART014": [
        ("Show me the enormous curved Ice Age tusk and massive grinding tooth.", "descriptive"),
        ("What is that prehistoric elephant ivory tusk from the frozen tundra?", "descriptive"),
        ("Which fossil exhibit displays the spiraled mammoth tusk and ridged chewing tooth?", "descriptive"),
        ("Tell me about the giant Ice Age mammal remains preserved from permafrost.", "descriptive"),
        ("What did Woolly Mammoths chew using their specialized ridged molars?", "attribute"),
        ("How long could a full-grown Woolly Mammoth curved tusk grow?", "attribute"),
        ("Tell me about the Woolly Mammoth Tusk and Molar.", "natural"),
        ("How did Ice Age mammoths use their tusks in snowy environments?", "natural"),
    ],
    "ART015": [
        ("Where is that prehistoric feline skull with the enormous blade-like upper fangs?", "descriptive"),
        ("Show me the fossil head of the Ice Age saber-toothed cat with curved canines.", "descriptive"),
        ("What is that predator skull from the tar pits with giant slicing teeth?", "descriptive"),
        ("Tell me about the extinct big cat that could open its jaws to nearly one hundred degrees.", "descriptive"),
        ("How long were the canine teeth of Smilodon fatalis?", "attribute"),
        ("How did saber-toothed cats use their long teeth without breaking them?", "attribute"),
        ("Tell me about the Smilodon fatalis sabertooth skull.", "natural"),
        ("Where were most Smilodon fatalis fossils like this skull discovered?", "natural"),
    ],
}

REALISTIC_DEICTIC_TEMPLATES = [
    "What am I looking at right here?",
    "Can you explain what this piece is?",
    "When was this created or found?",
    "Who was the creator or person behind this?",
    "What was the purpose or daily use of this item?",
    "Why is this artifact important enough to be in the museum?",
]

DISTANT_OOD_QUERIES = [
    "What is the weather forecast in New York City today?",
    "Can you write a Python function to reverse a linked list?",
    "How do I make a classic Italian margherita pizza from scratch?",
    "What is the capital city of Australia?",
    "What are the symptoms of seasonal allergies?",
    "How does the stock market work for beginners?",
    "Who won the FIFA World Cup final in 2022?",
    "What is 15 percent of 480?",
    "How do I reset my Windows computer password?",
    "Can you recommend a good action movie from this year?",
    "What is the distance between the Earth and the Sun?",
    "How do I brew cold brew coffee at home?",
    "Write an SQL query to calculate average customer spend.",
    "What are the health benefits of green tea?",
    "How do airplanes generate lift during takeoff?",
    "What is the current price of Ethereum?",
    "How do I prepare for a technical coding interview?",
    "Translate 'Good morning, how are you?' into German.",
    "What is quantum mechanics in simple terms?",
    "How do I remove coffee stains from a white shirt?",
    "What is the tallest mountain in North America?",
    "Can you teach me basic Spanish greetings?",
    "How does a car combustion engine work?",
    "What is the plot summary of Hamlet?",
    "How do I calculate compound interest on an investment?",
]

NEAR_DOMAIN_OOC_QUERIES = [
    "Where is Leonardo da Vinci's Mona Lisa exhibited?",
    "When was the Rosetta Stone discovered by French soldiers in Egypt?",
    "Tell me about King Tutankhamun's golden burial mask.",
    "Who sculpted the famous marble statue of David in Florence?",
    "Tell me about the Terracotta Army buried with Emperor Qin Shi Huang.",
    "What is the Code of Hammurabi inscribed on the basalt stele?",
    "Where can I see Vincent van Gogh's Starry Night painting?",
    "Tell me about the Wright Brothers 1903 Flyer at the Air and Space Museum.",
    "What discoveries were made by the Mars Curiosity Rover?",
    "Tell me about the Parthenon Marbles taken from the Acropolis.",
    "Where is the ancient Greek sculpture Venus de Milo located?",
    "Tell me about the Great Sphinx of Giza in Egypt.",
    "What is the historical significance of the Gutenberg Bible printed in 1455?",
    "Where is the Hope Diamond on display in Washington?",
    "Tell me about the original parchment of the United States Declaration of Independence.",
    "What is the prehistoric monument of Stonehenge in England used for?",
    "Who painted the Girl with a Pearl Earring?",
    "Tell me about the Roman Colosseum and gladiatorial games.",
    "What is the Dead Sea Scrolls collection discovered in Qumran caves?",
    "Show me the mask of Agamemnon discovered at Mycenae.",
    "Tell me about the prehistoric cave paintings in Lascaux France.",
    "Where is the original Magna Carta preserved today?",
    "Tell me about the ancient Egyptian bust of Queen Nefertiti.",
    "What is the Sutton Hoo Anglo-Saxon ship burial treasure?",
    "Tell me about the Viking longship discovered at Oseberg Norway.",
]

BOUNDARY_QUERIES = [
    "Tell me about old weapons.",
    "What space stuff is here?",
    "Ancient tools",
    "Prehistoric fossils",
    "Old American statues",
    "Aircraft",
    "Fossil bones",
    "Telegraphs and electricity",
    "Things made of bronze",
    "Artifacts from the 1800s",
]

def generate_benchmark():
    queries = []
    q_id = 1

    # 1. In-Scope Queries (120 queries)
    for art_id, q_list in REALISTIC_IN_SCOPE.items():
        for q_text, subtype in q_list:
            queries.append({
                "id": f"INS_{art_id}_{q_id:03d}",
                "question": q_text,
                "label": "in_scope",
                "target_artifact_id": art_id,
                "query_type": "realistic_in_scope",
                "subtype": subtype,
            })
            q_id += 1

    # 2. Deictic / Spatial Context Queries (90 queries)
    d_id = 1
    for art_id in REALISTIC_IN_SCOPE.keys():
        for prompt in REALISTIC_DEICTIC_TEMPLATES:
            queries.append({
                "id": f"DEI_{art_id}_{d_id:03d}",
                "question": prompt,
                "label": "in_scope",
                "target_artifact_id": art_id,
                "artifact_id": art_id,
                "query_type": "deictic",
            })
            d_id += 1

    # 3. Distant Out-of-Domain Queries (25 queries)
    for i, q in enumerate(DISTANT_OOD_QUERIES, 1):
        queries.append({
            "id": f"OOD_DIST_{i:03d}",
            "question": q,
            "label": "ood",
            "query_type": "ood_distant",
        })

    # 4. Hard Near-Domain Out-of-Catalog Queries (25 queries)
    for i, q in enumerate(NEAR_DOMAIN_OOC_QUERIES, 1):
        queries.append({
            "id": f"OOD_NEAR_{i:03d}",
            "question": q,
            "label": "ood",
            "query_type": "ood_near_domain",
        })

    # 5. Ambiguous / Boundary Queries (10 queries)
    for i, q in enumerate(BOUNDARY_QUERIES, 1):
        queries.append({
            "id": f"BOUND_{i:03d}",
            "question": q,
            "label": "boundary",
            "query_type": "boundary_ambiguous",
        })

    payload = {
        "version": "2.0-realistic",
        "total_queries": len(queries),
        "breakdown": {
            "in_scope_realistic": 120,
            "deictic_spatial": 90,
            "ood_distant": 25,
            "ood_near_domain": 25,
            "boundary_ambiguous": 10,
        },
        "queries": queries,
    }

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"[SUCCESS] Generated {len(queries)} realistic queries in:\n  {OUT_FILE}")

if __name__ == "__main__":
    generate_benchmark()
