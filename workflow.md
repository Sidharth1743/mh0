Scenario Script Document: TaskFriends App (v1.0 – MVP Focus)
Document Purpose

Remove all ambiguity by scripting real user sessions end-to-end.
Serve as the "bible" for UI/UX implementation (your domain) and backend enforcement (Dev B's domain).
Use this to validate: Does the flow feel safe, fun, progressive? Do tasks build trust naturally?
Format: Narrative scenes like a lightweight screenplay + annotated notes.

App Assumptions (to eliminate ambiguity)

Tech: React Native + Expo frontend, Convex backend.
Auth: Anonymous/device-based (no email/phone until Level 4 opt-in).
Nicknames: Auto-generated fun ones (e.g., "CuriousPanda42", "SunnyGamerX").
Matching: Happens in <30 sec if possible; fallback to "waiting pool" with tips.
Groups: Mostly pairs (2); up to 4 only if high compatibility.
Tasks: Start static (from JSON), later dynamic via AI if needed.
Real-time: Convex subscriptions for live task updates (both see contributions instantly).

Scene 1: First Launch & Onboarding (Low Anxiety Entry)
User opens app → Splash screen: "Make friends by doing stuff together. No profiles. No small talk. Just tasks." (Calm blue background, subtle animation of puzzle pieces fitting).
→ "Get Started" button →
Screen 1: Interests
"Pick what excites you (up to 5)"
Multi-select chips: Music, Fitness, Tech, Books, Cooking, Gaming, Movies, Travel, Art, Science, Outdoors, Humor, DIY, Pets, Food
(Pre-selected none; search bar at top)
Screen 2: Energy Level
"How's your vibe today?"
Three big buttons with icons:

Low (couch potato emoji) – "Chill mode"
Medium (walking person) – "Balanced"
High (rocket) – "Full energy"

Screen 3: Availability
"When are you free?"
Buttons: Right Now (10 min), 30 min slot, Today (flex), Weekend
Microcopy: "We'll match you with people in the same window."
→ "Find Buddies" button →
Loading screen: "Matching task partners… (fun fact: 87% of first tasks lead to a second one!)"
(Spinner + random encouraging tip)
Scene 2: First Match – Level 1 (Anonymous, Task-Only)
Notification: "Match found! Ready for a quick task?"
Screen: Matched with "MysticReader17" (nickname visible, avatar = colored abstract shape)
"You both like: Books + Tech, Medium energy, 30 min today"
Task assigned (auto-picked by Convex based on prefs):
Title: "Book-Tech Mashup"
Description: "Create a 3-item list of 'books that should become apps or games'. Take turns suggesting one, react with 👍 or idea tweak."
Why it builds trust: Neutral opinion-sharing, no personal info.
Task UI:

Shared editable list (real-time via Convex)
Your turn: Text input + "Add" button
Partner's additions appear live with timestamp
Reactions: Thumbs up / thinking emoji below each item
No direct chat yet (button grayed: "Chat unlocks after 2 tasks")
Top bar: "Task 1/∞ with MysticReader17" + exit button ("Leave quietly")

They complete: Both press "I'm Done" → mutual confirm popup: "Great job! List locked."
Post-task screen:
"Task complete! 🎉 You've done 1 task together."
Reactions: Quick emoji picker ("Fun!", "Easy", "Boring?")
Button: "Team up again?" (Yes/No)
If Yes → back to matching (high chance of same partner if both available).
Scene 3: Progression – Level 2 Unlock (After 2 Tasks)
After second task (e.g., "Vote on 3 sci-fi gadget ideas") →
Celebration modal: Confetti (Expo Lottie)
"Trust Level 2 Unlocked! 🎯"
"You've completed 2 tasks with MysticReader17. Short chat is now available – only task-related one-liners + emojis."
UI change: Chat bubble icon appears below task area (still no free chat; messages expire after task ends).
Example interaction:
You type: "That drone idea was wild 😂"
Partner: "Right? 🚀"
Scene 4: Level 3 – Voice & Deeper Tasks (After 4 Tasks)
Modal: "Level 3 – Voice mode unlocked (optional)"
New task example: "Solve this riddle together: 'I speak without a mouth and hear without ears…' Share a quick voice note on your guess."
UI: Mic button (Expo AV recording, 15-sec max) → playback before send.
Still anonymous (nicknames only).
Scene 5: Level 4 – Opt-in Reveal (After 6+ Tasks)
After task: Prompt:
"You've built 7 shared moments with MysticReader17. Feeling ready to know each other?"
Opt-in buttons:

"Reveal first name" (mutual – both must agree)
"Add photo" (optional, blurred until mutual)
"Move to WhatsApp/Instagram?" (copy invite link)

If both yes → names appear, photo optional.
History screen shows: "7 tasks completed – Started anonymous on Jan 28, 2026"
Scene 6: Edge Cases (Ambiguity Killers)

Partner drops mid-task: "MysticReader17 had to leave. Task paused. New match coming?" (Save partial progress? No – graceful reset.)
No match after 2 min: "Still searching… Want to tweak interests or try later?" + quick prefs edit.
Abuse: Report button always visible → "Report user" → blocks + reports to Convex (Dev B handles moderation queue).
Repeat decline: After 2 "No" to repeat → lower re-match priority (Dev B tunes algorithm).
Offline: Expo offline support – show cached task, sync when back.

Scene 7: Long-term Loop (Repeat & Off-ramp)
After 10 tasks:
History tab: Timeline view of past tasks (titles, dates, reactions).
Prompt: "You've got a solid buddy here. Want to suggest a real-life task off-app?" → generates invite text.