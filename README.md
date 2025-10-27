# Evallm - LLM Evaluation platform
A platform to evaluate Large Language Models (LLMs) for specific tasks.

![Code Size (bytes)](https://img.shields.io/github/languages/code-size/sdewhitt/evallm-v2)
![Repo Size](https://img.shields.io/github/repo-size/sdewhitt/evallm-v2)
![Last Commit](https://img.shields.io/github/last-commit/sdewhitt/evallm-v2)

Link: https://evallm.vercel.app

### Features
- User queries generate relevant responses from models by Meta, Google, and Mistral
- Users can view past experiments in a side panel, allowing them to pull up the respective analytics on click
- Cumulative statistics for each LLM are available on the "LLM Statistics" page
- LLM Statistics page also includes insights on each LLM's performance, generated using Meta's llama-3.1-8b-instant model


### Implementation Details
<p align="left">
  <a href="https://github.com/sebilune">
    <img src="https://skillicons.dev/icons?i=react,tailwind,ts,next,vercel,mongo&perline=8" />
  </a>
</p>

- MongoDB used for storage
- Next.js / Tailwind css frontend
- Current list of models used for responses:
   - llama-3.3-70b-versatile
   - llama-3.1-8b-instant
   - gemma2-9b-it
- LLM Responses evaluated based on:
   - Response time (ms)
   - % cosine similarity
   - % BLEU score
   - % ROUGE score

### Future Goals
- Experiment with letting users implement their own system prompts
- Statistical visualizations such as line graphs for the cumulative analytics
- More analysis metrics
   - Adjusted method for finding BLEU score so that its outputs are more unique
 
_Note: Evallm v1 with the old ui is no longer public_
