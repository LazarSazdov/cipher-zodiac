# Cipher Zodiac

A small static web app that demonstrates a homophonic substitution cipher for
the English alphabet.

## What it shows

You type English text and the page encodes it three ways, side by side, with a
character frequency chart under each one:

1. **Plaintext** - the cleaned input letters.
2. **Monoalphabetic swap** - one symbol per letter. The frequency chart keeps
   the same uneven shape as the plaintext, which is exactly what frequency
   analysis attacks rely on.
3. **Homophonic** - each letter is assigned several symbols based on how often
   that letter appears in English. When encoding, one of those symbols is picked
   at random for each occurrence, so the output frequency chart is roughly flat
   and hides the underlying letter frequencies.

The symbols come from a predefined pool, and the letter to symbol mapping is
assigned randomly. The number of symbols a letter receives is proportional to
its English frequency, so common letters like E and T get many symbols while
rare letters like Q and Z get one.

## Symbol sets

You can switch between four symbol pools from the dropdown:

- Zodiac and astrological symbols
- Emoji
- Chinese characters
- A mixed pool of the above

## Controls

- **Symbol set** - choose which glyph pool to use.
- **Shuffle mapping** - generate a fresh random mapping for the current set.

## How to run

Open `index.html` in any modern web browser. There is no build step, no server,
and no dependencies.
