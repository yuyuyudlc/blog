---
title: "CRDTs: The Math Behind Real-Time Collaboration"
category: 后端
date: June 15, 2026
readingTime: 12 min read
tags: [Math, CRDTs, Distributed Systems]
summary: Diving into operational invariance, Conflict-free Replicated Data Types, and peer-to-peer syncing without central databases.
---

Distributed real-time editing requires solving the core problem of consistency. When developer A and developer B write code concurrently, their operations must be merged in a deterministic fashion. One practical approach is to use Operation-based Conflict-free Replicated Data Types (CRDTs).

## Why Operational Transformation (OT) Falls Short

Operational Transformation is the classical approach used by tools like Google Docs. However, OT requires a central server to mediate conflict resolution and rewrite operations. In a developer tool aiming for peer-to-peer latency levels, a server-dependent design becomes a major bottleneck.

```javascript
// A simple index-based text merge conflict illustration
function naiveMerge(original, editA, editB) {
  // Without central ordering, client states diverge!
  return original + editA.text + editB.text; 
}
```

## Mathematical Invariance in LSEQ

By treating document elements as a tree of nodes ordered by fractional indexes, we can guarantee that inserts always preserve order. The coordinates are represented as unique paths of integers. When conflict arises (two clients inserting at the exact same location), client IDs act as a tie-breaker, providing a strict total order.

This structural guarantee allows developer teams to pair program smoothly across continents, with keystroke responses remaining completely local and instantaneous.
