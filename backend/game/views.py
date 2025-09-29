from rest_framework.decorators import api_view
from rest_framework.response import Response
import itertools

# ---------- Core Functions ----------

def check_cover(graph, chosen):
    chosen_set = set(chosen)
    uncovered = []
    for u, v in graph["edges"]:
        if u not in chosen_set and v not in chosen_set:
            uncovered.append([u, v])
    return {"is_valid": len(uncovered) == 0, "uncovered": uncovered}

def brute_force_min_cover(graph, limit=20):
    n = graph["n"]
    edges = graph["edges"]
    if n > limit:
        return None  # too large, skip
    for r in range(1, n + 1):
        for combo in itertools.combinations(range(n), r):
            chosen = set(combo)
            if all(u in chosen or v in chosen for u, v in edges):
                return {"size": r, "cover": list(combo)}
    return None

# ---------- API Endpoint ----------

@api_view(["POST"])
def evaluate(request):
    data = request.data
    graph = data.get("graph")
    chosen = data.get("chosen", [])

    if not graph or "n" not in graph or "edges" not in graph:
        return Response({"error": "Invalid graph"}, status=400)

    selected_size = len(chosen)
    cover_check = check_cover(graph, chosen)
    uncovered = cover_check["uncovered"]

    # compute optimal solution (brute force for small graphs)
    optimal = brute_force_min_cover(graph, limit=20)
    optimal_size = optimal["size"] if optimal else None

    # Case analysis
    if selected_size == 0:
        message = "No towers placed. Fire spreads everywhere!"
    elif not cover_check["is_valid"]:
        message = f"Your towers did not stop the fire. Uncovered paths: {uncovered}"
    elif optimal_size is not None:
        if selected_size == optimal_size:
            message = "🎉 Congratulations! You placed the minimum towers and stopped the fire!"
        elif selected_size > optimal_size:
            message = f"You stopped the fire, but used {selected_size} towers (minimum is {optimal_size})."
        else:  # smaller but somehow covers → should not happen unless bug
            message = "You used fewer than the minimum but still covered all paths (unexpected!)."
    else:
        message = "Fire stopped, but optimal solution could not be calculated (graph too large)."

    return Response({
        "isValidCover": cover_check["is_valid"],
        "uncoveredEdges": uncovered,
        "selectedSize": selected_size,
        "optimalSize": optimal_size,
        "message": message,
    })
