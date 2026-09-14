export const phase6Lessons = [
  {
    id:'embed-01', title:'What Is an Embedding?', description:'Discover how embedding models represent information in a mathematical space.', difficulty:'Beginner', xp:20, type:'embedding-intro',
    objective:'Understand embeddings as learned numerical representations that can encode useful relationships.',
    content:'<p>An <strong>embedding</strong> is a numerical representation produced by an embedding model. The model learns patterns that can place related information in useful regions of a vector space.</p><p>Embeddings do not “understand” language like a human. They encode patterns and relationships learned from data so downstream systems can compare representations.</p><p><strong>Illustrative only:</strong> the points in this lesson are not production embeddings.</p>',
    quiz:{question:'Which pair is likely to have more similar illustrative embeddings?',options:['dog + puppy','dog + refrigerator','banana + database','car + breakfast'],answer:0}
  },
  {
    id:'embed-02', title:'From Words to Vectors', description:'Follow text through an embedding model into an illustrative vector.', difficulty:'Beginner', xp:25, type:'text-vector',
    objective:'Understand the conceptual transformation Text → Embedding Model → Vector.',
    content:'<p>A vector is an ordered collection of numbers. An embedding model transforms input information into a vector whose dimensions can encode useful learned patterns.</p><p>The vectors below are <strong>illustrative educational vectors</strong>, not outputs from a real embedding model.</p>',
    examples:['Python is a programming language.','How do I fix my car?','A healthy breakfast can include fruit.'],
    quiz:{question:'What is a vector in this context?',options:['An ordered collection of numbers','A database table','A human-readable summary','A model license'],answer:0}
  },
  {
    id:'embed-03', title:'Dimensions & Vector Space', description:'Explore a 2D toy embedding space and see how dimensions create positions.', difficulty:'Beginner', xp:30, type:'vector-space',
    objective:'Understand dimensions and the idea of positioning representations inside a vector space.',
    points:[['Dog',0.30,0.30],['Puppy',0.36,0.25],['Cat',0.27,0.42],['Car',0.78,0.68],['Truck',0.84,0.62],['Apple',0.18,0.80],['Banana',0.25,0.74]],
    content:'<p>A vector can have many dimensions. We can visualize one, two, or three dimensions, but real embedding models may produce vectors with hundreds or thousands of dimensions.</p><p>This 2D map is a teaching device: nearby points suggest similar representations <em>within this toy space</em>. It is not a real embedding space.</p>',
    quiz:{question:'What does an embedding dimension represent?',options:['One coordinate in the vector representation','A guaranteed human-readable feature','The number of documents in a database','A universal quality score'],answer:0}
  },
  {
    id:'embed-04', title:'Measuring Similarity', description:'Compare illustrative vectors and see how distance and similarity can support retrieval.', difficulty:'Beginner', xp:30, type:'vector-compare',
    objective:'Understand that vector representations can be compared using mathematical similarity or distance measures.',
    pairs:[{name:'A ↔ B',a:[0.8,0.7],b:[0.75,0.72],label:'HIGH'},{name:'A ↔ C',a:[0.8,0.7],b:[0.1,0.2],label:'LOW'}],
    content:'<p>Once information is represented as vectors, a system can compare those vectors mathematically. Similarity measures help rank which representations are closer according to the chosen metric.</p><p>Similarity does not mean two texts are identical. The usefulness of the comparison depends on how the embedding model represents the data and which measure is used.</p>',
    quiz:{question:'What does a similarity score tell us?',options:['How closely two vector representations align according to a chosen measure','That two texts are identical','That one text is factually correct','That the vectors came from the same document'],answer:0}
  },
  {
    id:'embed-05', title:'Cosine Similarity', description:'Rotate two vectors and see how their angle changes cosine similarity.', difficulty:'Intermediate', xp:40, type:'cosine',
    objective:'Build intuition for cosine similarity as a comparison of vector orientation.',
    content:'<p><strong>Cosine similarity</strong> compares the orientation of two vectors. Vectors pointing in similar directions have a higher cosine similarity in the common formulation.</p><p>For vectors A and B: <code>cos(A,B) = (A · B) / (||A|| × ||B||)</code>. The embedding model creates the representation; cosine similarity simply compares the vectors.</p><p>The exact interpretation of values depends on the embedding space and similarity setup.</p>',
    quiz:{question:'What does cosine similarity compare?',options:['The orientation of two vectors','The number of words in two documents','The licenses of two models','The speed of two databases'],answer:0}
  },
  {
    id:'embed-06', title:'Semantic Search', description:'Compare keyword matching with meaning-oriented retrieval using a toy document collection.', difficulty:'Intermediate', xp:45, type:'semantic-search',
    objective:'Understand why semantic search can retrieve relevant text even when exact words differ.',
    documents:[
      ['How to maintain your car.','car maintenance'],['Beginner guide to Python.','python'],['Automobile engine troubleshooting.','automobile repair'],['Healthy breakfast recipes.','food'],['How to repair a bicycle.','bicycle repair']
    ],
    queries:['How do I fix my automobile?','How can I learn programming?','What should I eat for breakfast?'],
    content:'<p><strong>Keyword search</strong> focuses on matching terms. <strong>Semantic search</strong> uses vector representations to compare meaning according to the embedding space.</p><p>Real systems often combine retrieval strategies. Semantic search is not universally better; it is useful when meaning matters beyond exact wording.</p>',
    quiz:{question:'Why might “How do I fix my automobile?” retrieve a car-maintenance document?',options:['The representations can place related meanings near each other','Because the exact words are identical','Because the database changes the query','Because semantic search ignores all document content'],answer:0}
  },
  {
    id:'embed-07', title:'Chunking for Search', description:'Split a document into chunks and visualize overlap before embedding.', difficulty:'Intermediate', xp:40, type:'chunking',
    objective:'Understand why documents are often chunked and why chunk size and overlap are application-dependent.',
    text:'Embeddings help applications retrieve useful pieces of information. Large documents are often split into smaller chunks so retrieval can focus on more specific passages. Chunk size and overlap depend on document type, retrieval goals, embedding model, context needs, storage, and latency.',
    quiz:{question:'Why can overlap between chunks be useful?',options:['It can preserve context across a chunk boundary','It guarantees perfect retrieval','It eliminates the need for embeddings','It makes every document shorter'],answer:0}
  },
  {
    id:'embed-08', title:'What Is a Vector Database?', description:'Inspect a simulated vector store containing vectors and metadata.', difficulty:'Intermediate', xp:45, type:'vector-db',
    objective:'Understand that vector stores keep vector representations with metadata and support similarity retrieval.',
    rows:[['Chunk 001','[0.81, 0.24, 0.71…]','Python'],['Chunk 002','[0.13, 0.76, 0.22…]','Cars'],['Chunk 003','[0.77, 0.31, 0.68…]','AI'],['Chunk 004','[0.22, 0.80, 0.19…]','Food']],
    content:'<p>A <strong>vector database</strong> or vector store is designed to store vector representations and retrieve similar vectors efficiently, often alongside metadata such as document IDs, titles, or categories.</p><p>The conceptual flow is <strong>document → chunk → embedding → vector + metadata → vector store</strong>, followed by <strong>query → query embedding → similarity search → top results</strong>.</p>',
    quiz:{question:'What can accompany a stored vector?',options:['Metadata such as a document ID or category','Only another vector','A mandatory API key','Nothing else'],answer:0}
  },
  {
    id:'embed-09', title:'Build a Semantic Search Engine', description:'Build a miniature retrieval pipeline from documents to ranked results.', difficulty:'Challenge', xp:75, type:'search-builder',
    documents:[['Python Basics','Python is a programming language used to build scripts and applications.'],['Car Maintenance','Regular vehicle maintenance includes checking fluids, tires, brakes, and service intervals.'],['Semantic Search','Semantic retrieval compares vector representations to find relevant information by meaning.'],['Breakfast Guide','A balanced breakfast can combine fruit, grains, protein, and other foods.'],['Bicycle Repair','Bicycle repair can involve tires, brakes, chains, gears, and other components.']],
    quiz:{question:'Which sequence best describes a semantic search pipeline?',options:['Documents → chunks → embeddings → vector store → query embedding → similarity search','Documents → CSS → database → answer','Query → license → model download → result','Documents → keyword deletion → UI only'],answer:0}
  },
  {
    id:'embed-10', title:'EMBEDDINGS — FINAL BOSS', description:'Design a retrieval architecture for a documentation assistant.', difficulty:'Final Boss', xp:200, type:'embedding-final',
    objective:'Design and justify a coherent embedding and vector-search pipeline.',
    content:'<p><strong>Scenario:</strong> A software company has thousands of documentation pages. Users should ask natural-language questions and retrieve the most relevant documentation.</p><p>There is room for tradeoffs: whole documents can be useful in some cases, but chunks often allow more focused retrieval. A passing design should be logically consistent rather than blindly matching one “correct” recipe.</p>',
    documentModes:['Whole documents','Chunks'], representations:['Raw text only','Embeddings'], searches:['Exact keyword matching','Semantic vector search'], stores:['Vector database','Traditional text file'], reasons:['Represent semantic information numerically','Compare meaning using vector similarity','Retrieve relevant information','Enable semantic search','Prepare information for downstream LLM generation'],
  }
];

export const phase6Achievements = [
 ['embedding-explorer','🧠','EMBEDDING EXPLORER','Complete Mission 1.'],['vector-thinker','🔢','VECTOR THINKER','Complete Mission 2.'],['dimension-explorer','📐','DIMENSION EXPLORER','Complete Mission 3.'],['similarity-seeker','📏','SIMILARITY SEEKER','Complete Mission 4.'],['cosine-navigator','📐','COSINE NAVIGATOR','Complete Mission 5.'],['semantic-searcher','🔎','SEMANTIC SEARCHER','Complete Mission 6.'],['chunk-master','✂️','CHUNK MASTER','Complete Mission 7.'],['vector-vault','🗄','VECTOR VAULT','Complete Mission 8.'],['search-engine-builder','🛠','SEARCH ENGINE BUILDER','Complete Mission 9.'],['vector-search-architect','🏆','VECTOR SEARCH ARCHITECT','Complete the Final Boss.']
].map(([id,icon,title,description])=>({id,icon,title,description}));