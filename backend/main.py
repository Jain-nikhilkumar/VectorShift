from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque

app = FastAPI()

# CORS so the React frontend (localhost:3000) can call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Node(BaseModel):
    id: str
    type: str | None = None
    position: Dict[str, float] | None = None
    data: Dict[str, Any] | None = None


class Edge(BaseModel):
    id: str | None = None
    source: str
    target: str
    sourceHandle: str | None = None
    targetHandle: str | None = None


class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """Kahn's algorithm: topological sort succeeds iff graph is a DAG."""
    if not nodes:
        return True

    node_ids = {n.id for n in nodes}
    in_degree = {nid: 0 for nid in node_ids}
    adj = defaultdict(list)

    for e in edges:
        # ignore edges that reference unknown nodes
        if e.source in node_ids and e.target in node_ids:
            adj[e.source].append(e.target)
            in_degree[e.target] += 1

    queue = deque([nid for nid, d in in_degree.items() if d == 0])
    visited = 0

    while queue:
        nid = queue.popleft()
        visited += 1
        for nxt in adj[nid]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)

    return visited == len(node_ids)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    return {
        'num_nodes': len(pipeline.nodes),
        'num_edges': len(pipeline.edges),
        'is_dag': is_dag(pipeline.nodes, pipeline.edges),
    }
