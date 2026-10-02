# Graph Report - .  (2026-08-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 17 nodes · 20 edges · 5 communities (3 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00dcff04`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- onScroll
- arm
- pad

## God Nodes (most connected - your core abstractions)
1. `onScroll()` - 3 edges
2. `sweepReveals()` - 3 edges
3. `markRevealed()` - 2 edges
4. `litJourney()` - 2 edges
5. `go()` - 2 edges
6. `arm()` - 2 edges
7. `pad()` - 2 edges
8. `tickCd()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (5 total, 2 thin omitted)

### Community 1 - "onScroll"
Cohesion: 0.50
Nodes (4): litJourney(), markRevealed(), onScroll(), sweepReveals()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `onScroll()` connect `onScroll` to `main.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `sweepReveals()` connect `onScroll` to `main.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._