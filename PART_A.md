# Part A: Two core features for Coy

Coy does one thing really well: it answers "do they like me back?" without ever exposing you. Both suggestions below keep that promise. Neither one reveals who added you, adds counts, or lets someone test names.

---

## 1. A first move, built into the match

### What it is

Right now a match ends with "Say hi on WhatsApp", and then Coy steps out.

I'd add a small step between the match and the chat. Both people get the same light question, for example *"coffee, a walk, or just text for now?"* Each picks privately, and Coy only shows what they have in common. If both pick "coffee", that's the plan. If there's no overlap, Coy just shows the WhatsApp button like it does today, and nobody sees what the other picked.

It's optional, it takes one tap, and it disappears after it's used.

### Why it's needed

- **The match is the easy part. Saying the first thing is the hard part.** Coy works because people are too shy to make the first move. A match proves you both like each other, but someone still has to open WhatsApp and type the first message, which is the exact moment Coy was built to remove.
- **It uses the same idea as the rest of Coy.** "Only reveal what's mutual" is the whole product. Applying it to *what you'd like to do*, not just *whether you like each other*, is a natural next step, not a new product.
- **It turns matches into actual conversations.** If matches don't lead anywhere, people stop adding crushes and stop inviting friends. Helping the first conversation happen protects the whole loop.
- **No chat needed.** Coy deliberately has no chat. This isn't chat. It's one private question with a mutual-only answer, and then it hands off to WhatsApp as before.

---

## 2. Letting go of a crush, safely

### What it is

Today adding is final, which is the right default: it stops people adding and removing names to work out who likes them.

The problem is that a crush slot can sit there forever. If the heads-ups have all gone out (Coy sends at most 3) and nothing has happened after a long time, the person is stuck with a dead slot.

I'd let a slot be **released only after a long cooldown**, say 90 days after the last heads-up. Releasing:

- frees the slot to use on someone else, and
- blocks re-adding the same person for a long time (or permanently).

From the outside, nothing visible changes. The other person never gets a message, and no count goes up or down.

### Why it's needed

- **Three free slots run out fast when one is stuck.** Feelings change, especially in college. A slot tied to someone you're over is both sad and useless, and the main options left are to pay for more or to stop using Coy.
- **It doesn't break "adding is final".** That rule exists to stop people probing. Probing needs quick add/remove cycles. A 90-day wait with a long re-add block makes that useless, while still giving honest users a way to move on.
- **It keeps people coming back.** A user who can move on to a new crush stays active and keeps inviting friends. A user staring at three dead slots quietly leaves.
- **It can live alongside paid slots.** Bought slots still make sense for people who want more than three at once. This only stops slots from being *lost* forever, so it builds trust rather than replacing revenue.

---

### What I'd measure

| Feature | Signal it's working |
| --- | --- |
| First move | Share of matches where the first-move step is used; share of matches where someone taps through to WhatsApp |
| Slot release | 90-day retention of users with a released slot vs. similar users without; whether released slots get re-used |
