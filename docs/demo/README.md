# Cover narrated local preview

[Watch the MP4 preview](preview.mp4) · [Read the narration](TRANSCRIPT.md) · [Scene captions](captions.vtt) · [Storyboard and source provenance](storyboard.json)

This is an edited narrated walkthrough assembled from actual local UI screenshots. It is **not a continuous interaction recording**. All payments and companies are synthetic. PayPal/Gemini execution, real attention, customer validation, payouts and production identity are not established by this preview. No public video URL is claimed.

The coordinator captured all six frames from **a40f89b** while completing the browser workflow described in [round-two QA](../ROUND2_QA.md). Subsequent implementation **3a76966** adds refund/provider operation IDs to activity receipts and conservative handling of legacy expired checkouts. Those later changes are tested separately and are not portrayed as captured here.

The narration uses a synthesized voice. Scene captions identify the topic and simulation mode; the full narration is available in the transcript. Intermediate rendering files are excluded from version control. The original PNG frames are retained for inspection at their native resolution, including the 375px mobile states.

Verification: the exported file is **145.346 seconds**, 1280×720 H.264 video with AAC audio and an embedded `mov_text` scene-caption stream. The complete file decoded without ffmpeg errors. All six source frames and a decoded mobile video frame were visually inspected; the output preserves aspect ratio and pads the phone frame without cropping. Stream checks establish export integrity, not live interaction or narration-content verification by an independent viewer.
