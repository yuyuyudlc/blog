---
title: Why We Designed Our Own GPU UI Framework
category: 前端
date: May 30, 2026
readingTime: 8 min read
tags: [GPU, Renderer, UI, Metal]
summary: Bypassing Electron, the DOM, and traditional render pools to construct a custom rasterizer running straight on Metal and Vulkan.
---

Most modern desktop applications are built using Web Technologies (Electron) or native wrappers. While highly flexible, these abstractions introduce massive layers of memory and CPU overhead. For latency-sensitive editor workloads, a custom UI framework that renders directly via the GPU can be a better fit.

<blockquote>
  "If you want to control your performance, you must control the pixels."
</blockquote>

## Bypassing the DOM

By throwing away the DOM, layout engines, and standard CSS parsers, the renderer reduces memory overhead by over 90%. The UI layer lays out components using a lightweight Flexbox-like layout engine built in Rust, translates it into render commands, and ships them directly to GPU buffers.

This layout and rendering pipeline executes inside a single frame budget of 8.3ms (for 120Hz displays), giving us immediate feedback on typing, scrolling, and search queries.
