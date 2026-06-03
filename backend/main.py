from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from collections import defaultdict, deque

app = FastAPI(title="VectorShift Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Node(BaseModel):
    id: str
    type: Optional[str] = None
    position: Optional[Dict[str, float]] = None
    data: Optional[Dict[str, Any]] = None


class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


def find_cycle_edges(nodes: List[Node], edges: List[Edge]) -> tuple[bool, List[str]]:
    """
    Returns (is_dag, list_of_edge_ids_that_form_cycles).

    Uses DFS coloring: white=0, gray=1 (in current path), black=2 (done).
    Edges from a node to a gray ancestor are back-edges = cycle members.
    """
    node_ids = {n.id for n in nodes}
    if not node_ids:
        return True, []

    adj = defaultdict(list)  # source -> list of (target, edge_id)
    for e in edges:
        if e.source in node_ids and e.target in node_ids:
            adj[e.source].append((e.target, e.id or f"{e.source}-{e.target}"))

    color = {nid: 0 for nid in node_ids}
    cycle_edges = []

    def dfs(u):
        color[u] = 1  # gray
        for (v, eid) in adj[u]:
            if color[v] == 1:
                cycle_edges.append(eid)
            elif color[v] == 0:
                dfs(v)
        color[u] = 2  # black

    for nid in node_ids:
        if color[nid] == 0:
            dfs(nid)

    return len(cycle_edges) == 0, cycle_edges


@app.get('/')
def read_root():
    return {'status': 'ok', 'service': 'VectorShift Pipeline API'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    is_dag, cycle_edge_ids = find_cycle_edges(pipeline.nodes, pipeline.edges)
    return {
        'num_nodes': len(pipeline.nodes),
        'num_edges': len(pipeline.edges),
        'is_dag': is_dag,
        'cycle_edge_ids': cycle_edge_ids,
    }
