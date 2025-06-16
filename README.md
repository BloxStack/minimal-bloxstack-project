# Bloxstack Project

This is a Bloxstack project that provides a modern development experience for building Roblox applications. Learn more at [bloxstack.app](https://bloxstack.app).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [AI Integration](#ai-integration)

## Prerequisites

Before getting started, ensure you have the following tools installed:

1. **Bloxstack CLI** - Install globally:
   ```bash
   npm install -g @bloxstack/cli@latest
   ```

2. **Rojo** - Required for Roblox development. Install from [rojo.space](https://rojo.space) or use:
   ```bash
   # Install via Aftman (recommended)
   aftman install
   
   # Or install directly from GitHub releases
   # Visit https://github.com/rojo-rbx/rojo/releases
   ```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The application will be available at the URL shown in your terminal after running the development command. Input this exact hostname/port format into the Rojo plugin in Roblox Studio to sync your code.

## AI Integration

If you want to use AI outside the Bloxstack Forge platform, we recommend using `BLOXSTACK.md` as context for the LLM to provide better assistance with your project.