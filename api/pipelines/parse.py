"""
Vercel serverless function for /api/pipelines/parse
Handles POST requests to analyze pipeline (count nodes/edges + detect cycles)
"""

from http.server import BaseHTTPRequestHandler
import json
from collections import defaultdict


def find_cycle_edges(nodes, edges):
    """Detect cycles using DFS coloring. Returns (is_dag, list_of_cycle_edge_ids)."""
    node_ids = {n.get('id') for n in nodes}
    if not node_ids:
        return True, []

    adj = defaultdict(list)
    for e in edges:
        src = e.get('source')
        tgt = e.get('target')
        eid = e.get('id') or f"{src}-{tgt}"
        if src in node_ids and tgt in node_ids:
            adj[src].append((tgt, eid))

    color = {nid: 0 for nid in node_ids}  # 0=white, 1=gray, 2=black
    cycle_edges = []

    def dfs(u):
        color[u] = 1
        for (v, eid) in adj[u]:
            if color[v] == 1:
                cycle_edges.append(eid)
            elif color[v] == 0:
                dfs(v)
        color[u] = 2

    for nid in node_ids:
        if color[nid] == 0:
            dfs(nid)

    return len(cycle_edges) == 0, cycle_edges


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            nodes = data.get('nodes', [])
            edges = data.get('edges', [])

            is_dag, cycle_edge_ids = find_cycle_edges(nodes, edges)
            result = {
                'num_nodes': len(nodes),
                'num_edges': len(edges),
                'is_dag': is_dag,
                'cycle_edge_ids': cycle_edge_ids,
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
