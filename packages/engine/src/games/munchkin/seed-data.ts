import type { MunchkinCard } from './types';

let _cardIdCounter = 1;
function cid(): string {
  return `seed_${String(_cardIdCounter++).padStart(4, '0')}`;
}

// ── Monsters (30) ──────────────────────────────────────────────────────────────

const monsters: MunchkinCard[] = [
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Potted Plant', description: 'It just sits there. Menacingly.', flavorText: 'You suspect it has been watered with evil.', level: 1, treasureCount: 1, badStuff: 'Lose 1 level from sheer embarrassment.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Squirrel of Doom', description: 'It has acorns and it knows how to use them.', level: 2, treasureCount: 1, badStuff: 'Lose 1 item to the acorn horde.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Undead Hamster', description: 'Level 3 undead. Tiny but terrifying.', level: 3, treasureCount: 2, badStuff: 'Lose 2 levels from cute-undead PTSD.', elementTags: ['undead', 'animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Bureaucratic Dragon', description: 'Breathes forms. Level 5.', level: 5, treasureCount: 2, badStuff: 'Fill out 3 imaginary tax forms. Lose 1 level.', elementTags: ['fire'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Tax Collector Troll', description: 'Takes gold, gives receipts. Level 4.', level: 4, treasureCount: 2, badStuff: 'Lose 500 gold or 1 level.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Vengeful Intern', description: 'Armed with a staple gun. Level 2.', level: 2, treasureCount: 1, badStuff: 'Discard 1 hand card.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'The Floating Nose', description: 'Level 6. Smells fear. And you.', level: 6, treasureCount: 3, badStuff: 'Lose your headgear or 1 level.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Gelatinous Cube of Bureaucracy', description: 'Level 7. Contains 12 unprocessed invoices.', level: 7, treasureCount: 3, badStuff: 'Lose all equipped items in one slot.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Angry Accountant Lich', description: 'Level 8. Undead. Carries spreadsheets.', level: 8, treasureCount: 3, badStuff: 'Lose 2 levels.', elementTags: ['undead'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Dire Chihuahua', description: 'Level 1. Small, loud, relentless.', level: 1, treasureCount: 1, badStuff: 'Lose 1 hand card.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Level 9 Kitten', description: 'Level 9. Absolutely ruthless. Cute though.', level: 9, treasureCount: 4, badStuff: 'Lose 3 levels and apologize to it.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Sorcerer of Mild Inconvenience', description: 'Level 5. Curses you with minor annoyances.', level: 5, treasureCount: 2, badStuff: 'Lose 1 equipped item (your choice).', elementTags: ['poison'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'The Abstract Concept', description: 'Level 6. You cannot describe it.', level: 6, treasureCount: 3, badStuff: 'Lose 1 level and gain existential dread.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Frost Wyrm of Mild Chill', description: 'Level 7. Breathes lukewarm cold.', level: 7, treasureCount: 3, badStuff: 'Lose boots or 1 level.', elementTags: ['cold', 'flying'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Politeness Golem', description: 'Level 3. You feel bad fighting it.', level: 3, treasureCount: 2, badStuff: 'Lose 1 level from guilt.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Recursive Slime', description: 'Level 4. Splits every round. Sort of.', level: 4, treasureCount: 2, badStuff: 'Lose 2 hand cards.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Flying Spaghetti Menace', description: 'Level 6. Blessed by a carb deity.', level: 6, treasureCount: 3, badStuff: 'All players lose 1 card.', elementTags: ['flying'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'The Lawyer', description: 'Level 8. May counter any combat advantage.', level: 8, treasureCount: 4, badStuff: 'Lose 1 level and pay 200 gold in fees.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Phantom of the Opera (Parody)', description: 'Level 7. Sings at inconvenient moments.', level: 7, treasureCount: 3, badStuff: 'Discard 2 hand cards.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Motivational Demon', description: 'Level 5. Tells you to believe in yourself, then attacks.', level: 5, treasureCount: 2, badStuff: 'Lose 1 level.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'The Mighty Weasel', description: 'Level 4. Surprisingly cunning.', level: 4, treasureCount: 2, badStuff: 'Lose your accessory slot item.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Necromancer With a Cold', description: 'Level 5. Sneezes raise the dead. Accidentally.', level: 5, treasureCount: 2, badStuff: 'Lose 1 level.', elementTags: ['undead'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Scorpion of Accounting', description: 'Level 6. Poison and quarterly reports.', level: 6, treasureCount: 3, badStuff: 'Lose 1 level and 200 gold.', elementTags: ['poison', 'animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Giant Space Hamster', description: 'Level 8. In spaaace.', level: 8, treasureCount: 4, badStuff: 'Lose 2 levels.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Mime of Doom', description: 'Level 3. Silent. Deadly. Theatrical.', level: 3, treasureCount: 2, badStuff: 'Must mime your next action.' },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Clockwork Badger', description: 'Level 4. Wind it up and regret it.', level: 4, treasureCount: 2, badStuff: 'Lose 1 equipped item.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Ice Cream Golem', description: 'Level 2. Melts in combat. Causes brain freeze.', level: 2, treasureCount: 1, badStuff: 'Skip your next LOOT phase.', elementTags: ['cold'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Corrupted Houseplant', description: 'Level 3. Photosynthesizes darkness.', level: 3, treasureCount: 2, badStuff: 'Lose 1 level.', elementTags: ['poison'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Vengeful Flamingo', description: 'Level 4. Stands on one leg. Punches with the other.', level: 4, treasureCount: 2, badStuff: 'Lose your footwear.', elementTags: ['animal', 'flying'] },
  { id: cid(), type: 'DOOR', subtype: 'monster', name: 'Elder Chaos Poodle', description: 'Level 10. The final form.', level: 10, treasureCount: 5, badStuff: 'Lose 3 levels and 1 equipped item.', elementTags: ['animal'] },
];

// ── Curses (10) ───────────────────────────────────────────────────────────────

const curses: MunchkinCard[] = [
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Lose a Level', description: 'Lose 1 level immediately.', flavorText: 'The universe is personally invested in your failure.' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Lose Your Headgear', description: 'Discard your equipped head item (if any).' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Lose Your Footwear', description: 'Discard your equipped feet item (if any).' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Lose 500 Gold', description: 'Lose 500 gold (minimum 0).', flavorText: 'Every coin has two sides. This one is bad.' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Change Race', description: 'Change your race to a random one.', flavorText: 'Identity is overrated.' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Lose Your Class', description: 'You lose your class until end of next turn.' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Discard 2 Cards', description: 'Discard 2 hand cards of your choice.' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Lose Your Armor', description: 'Discard your equipped body armor (if any).' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Duck of Doom', description: 'Add +2 to the next monster you fight.', flavorText: 'Quack quack, your doom approaches.' },
  { id: cid(), type: 'CURSE', subtype: 'curse', name: 'Curse! Tax Collector', description: 'Give 1 card from your hand to each other player.', flavorText: 'Redistribution of suffering.' },
];

// ── Races & Classes (10) ──────────────────────────────────────────────────────

const racesAndClasses: MunchkinCard[] = [
  { id: cid(), type: 'DOOR', subtype: 'race', name: 'Elf', description: 'Gain 1 level when you successfully Run Away.' },
  { id: cid(), type: 'DOOR', subtype: 'race', name: 'Dwarf', description: 'You may carry 1 extra Big Item.' },
  { id: cid(), type: 'DOOR', subtype: 'race', name: 'Halfling', description: 'Discard 1 card to add +1 to any Run Away roll.' },
  { id: cid(), type: 'DOOR', subtype: 'race', name: 'Orc', description: '+1 Combat power per level above 3.' },
  { id: cid(), type: 'DOOR', subtype: 'class', name: 'Warrior', description: 'Discard 1 card during combat for +3 power.' },
  { id: cid(), type: 'DOOR', subtype: 'class', name: 'Wizard', description: 'Use any number of one-shot items in combat.' },
  { id: cid(), type: 'DOOR', subtype: 'class', name: 'Thief', description: 'Steal 1 item from a fleeing player once per turn.' },
  { id: cid(), type: 'DOOR', subtype: 'class', name: 'Cleric', description: 'Discard any card to auto-flee from Undead.' },
  { id: cid(), type: 'DOOR', subtype: 'class', name: 'Ranger', description: 'Ignore Bad Stuff from Animal monsters.' },
  { id: cid(), type: 'DOOR', subtype: 'ally', name: 'Hireling', description: 'Pay 3 cards to gain a +3 combat ally.', flavorText: 'Minimum wage heroism.' },
];

// ── Misc Door Cards (10) ──────────────────────────────────────────────────────

const miscDoor: MunchkinCard[] = [
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Everyone Is a Duck Now', description: 'All players lose their class for 1 round.', trigger: 'immediate', scope: 'all_players' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Gravity Vacation', description: 'Big items don\'t count as big this round.', trigger: 'immediate', scope: 'all_players' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Unsolicited Advice', description: 'Player to your left advises you. Win = +1 level, Lose = they lose 1.', trigger: 'immediate', scope: 'target_player' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Plot Armor', description: 'Lowest-level player is immune to Bad Stuff this turn.', trigger: 'immediate', scope: 'target_player' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Dramatic Entrance', description: 'Shuffle hand into deck, draw 5 new cards.', trigger: 'immediate', scope: 'active_player' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Confusion Reigns', description: 'All players swap hands simultaneously.', trigger: 'immediate', scope: 'all_players' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Tax Season', description: 'Player with most gold loses 500 to the bank.', trigger: 'immediate', scope: 'all_players' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Motivational Speech', description: 'Active player gains +1 level, loses all equipped items.', trigger: 'immediate', scope: 'active_player' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'Betrayal Arc', description: 'All ally relationships are canceled for this round.', trigger: 'immediate', scope: 'all_players' },
  { id: cid(), type: 'DOOR', subtype: 'situation', name: 'I Cast Magic Missile', description: 'Any wizard may negate 1 curse during combat.', trigger: 'persistent_until_end_of_turn', scope: 'combat' },
];

// ── Items (60) ────────────────────────────────────────────────────────────────

const items: MunchkinCard[] = [
  // Head
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Horned Helmet', description: '+2 combat.', itemSlot: 'head', itemBonus: 2, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Pointy Hat of Power', description: '+3 combat. Wizard only.', itemSlot: 'head', itemBonus: 3, itemValue: 600, classRestrict: ['wizard'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Helmet of Heroic Delusion', description: '+1 combat. +1 when losing.', itemSlot: 'head', itemBonus: 1, itemValue: 200 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Crown of Mediocrity', description: '+0 combat. Looks impressive though.', itemSlot: 'head', itemBonus: 0, itemValue: 100, flavorText: 'Royalty is a mindset.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Dunce Cap of Doom', description: '+4 combat but lose 1 intelligence (flavor).', itemSlot: 'head', itemBonus: 4, itemValue: 800 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Battle Bonnet', description: '+2 combat.', itemSlot: 'head', itemBonus: 2, itemValue: 400 },
  // Body
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Chainmail Bikini', description: '+2 combat. Not your torso is unprotected.', itemSlot: 'body', itemBonus: 2, itemValue: 400, flavorText: 'Technically armor.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Armor of Questionable Origin', description: '+3 combat.', itemSlot: 'body', itemBonus: 3, itemValue: 600 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Robe of the Archmage', description: '+4 combat. Wizard only.', itemSlot: 'body', itemBonus: 4, itemValue: 800, classRestrict: ['wizard'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Holy Armor of the Paladin', description: '+3 combat. Cleric only.', itemSlot: 'body', itemBonus: 3, itemValue: 600, classRestrict: ['cleric'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Plate Mail of Pain', description: '+5 combat. Big item.', itemSlot: 'body', itemBonus: 5, itemValue: 1000, bigItem: true },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Leather Jerkin', description: '+1 combat.', itemSlot: 'body', itemBonus: 1, itemValue: 200 },
  // Feet
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Boots of Butt-Kicking', description: '+2 combat.', itemSlot: 'feet', itemBonus: 2, itemValue: 400, flavorText: 'The kicking is implied.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Sneakers of Sneakiness', description: '+1 combat. +2 for Thieves.', itemSlot: 'feet', itemBonus: 1, itemValue: 200 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Sandals of the Gods', description: '+3 combat.', itemSlot: 'feet', itemBonus: 3, itemValue: 600 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Rocket-Powered Roller Skates', description: '+3 combat. Big item.', itemSlot: 'feet', itemBonus: 3, itemValue: 600, bigItem: true },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Fuzzy Bunny Slippers', description: '+1 combat. Animals ignore you.', itemSlot: 'feet', itemBonus: 1, itemValue: 200, flavorText: 'Adorable and somehow effective.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Steel-Toed Boots', description: '+2 combat.', itemSlot: 'feet', itemBonus: 2, itemValue: 400 },
  // Hands
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Broad Sword', description: '+3 combat. 2 hands.', itemSlot: 'hand', itemBonus: 3, itemValue: 600 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Staff of Napalm', description: '+4 combat. Wizard only.', itemSlot: 'hand', itemBonus: 4, itemValue: 800, classRestrict: ['wizard'], elementTags: ['fire'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Rapier of Unfair Advantage', description: '+2 combat. Thief only.', itemSlot: 'hand', itemBonus: 2, itemValue: 400, classRestrict: ['thief'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Club of the Warrior', description: '+3 combat. Warrior only.', itemSlot: 'hand', itemBonus: 3, itemValue: 600, classRestrict: ['warrior'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Holy Hand Grenade', description: '+5 combat vs. Undead. 1 hand.', itemSlot: 'hand', itemBonus: 5, itemValue: 1000, elementTags: ['undead'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Flail of Ultimate Power', description: '+4 combat. 2 hands. Big item.', itemSlot: 'hand', itemBonus: 4, itemValue: 800, bigItem: true },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Wand of Polymorph', description: '+2 combat. Wizard only.', itemSlot: 'hand', itemBonus: 2, itemValue: 400, classRestrict: ['wizard'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Shield of Incredible Deflection', description: '+2 combat. 1 hand.', itemSlot: 'hand', itemBonus: 2, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Bow of Unfortunate Accuracy', description: '+3 combat. Ranger only. 2 hands.', itemSlot: 'hand', itemBonus: 3, itemValue: 600, classRestrict: ['ranger'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Scepter of Dubious Power', description: '+2 combat.', itemSlot: 'hand', itemBonus: 2, itemValue: 400 },
  // Accessories
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Amulet of Unnecessary Complexity', description: '+2 combat. Discard to negate 1 curse.', itemSlot: 'accessory', itemBonus: 2, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Ring of Phenomenal Power', description: '+3 combat. Wizard only.', itemSlot: 'accessory', itemBonus: 3, itemValue: 600, classRestrict: ['wizard'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Lucky Rabbit Foot', description: '+1 combat. Flee rolls +1.', itemSlot: 'accessory', itemBonus: 1, itemValue: 200, elementTags: ['animal'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Belt of Gender Bending', description: '+2 combat.', itemSlot: 'accessory', itemBonus: 2, itemValue: 400, flavorText: 'Fashion is fluid.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Cloak of Obscurity', description: '+2 combat. Thief only.', itemSlot: 'accessory', itemBonus: 2, itemValue: 400, classRestrict: ['thief'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Medallion of the Cleric', description: '+3 combat. Cleric only.', itemSlot: 'accessory', itemBonus: 3, itemValue: 600, classRestrict: ['cleric'] },
  // One-shot items (no slot)
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Potion of Strength', description: '+3 combat this fight. One use.', itemBonus: 3, itemValue: 300, elementTags: ['fire'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Scroll of Minor Annoyance', description: '+2 combat this fight. One use.', itemBonus: 2, itemValue: 200 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Instant Wall', description: '+5 to flee roll. One use.', itemBonus: 0, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Acid Potion', description: '+2 combat vs animals. One use.', itemBonus: 2, itemValue: 200, elementTags: ['poison', 'animal'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Freeze Ray', description: '+4 combat. Adds cold tag to monster. One use.', itemBonus: 4, itemValue: 600, elementTags: ['cold'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Fireball', description: '+5 combat vs undead. One use.', itemBonus: 5, itemValue: 800, elementTags: ['fire', 'undead'] },
  // Big items
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Oversized Axe of Mayhem', description: '+5 combat. Big item. 2 hands.', itemSlot: 'hand', itemBonus: 5, itemValue: 1000, bigItem: true },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Dragon Armor', description: '+6 combat. Big item.', itemSlot: 'body', itemBonus: 6, itemValue: 1200, bigItem: true },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Yendorian Express Card', description: '+3 combat. Pay gold to boost by 2 more.', itemBonus: 3, itemValue: 600 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Tuba of Charm', description: '+1 combat. Other players cannot hinder you this turn.', itemSlot: 'hand', itemBonus: 1, itemValue: 200, bigItem: true },
  // Unique / quirky items
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Swiss Army Polearm', description: '+3 combat. Has 27 attachments.', itemSlot: 'hand', itemBonus: 3, itemValue: 600 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Mithril Longsword', description: '+4 combat.', itemSlot: 'hand', itemBonus: 4, itemValue: 800 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Backup Dagger', description: '+1 combat. Emergency only.', itemSlot: 'hand', itemBonus: 1, itemValue: 100, flavorText: 'Always have a backup.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Vorpal Sword', description: '+5 combat. Snicker-snack.', itemSlot: 'hand', itemBonus: 5, itemValue: 1000 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Flaming Torch of Obvious Purpose', description: '+2 combat. +4 vs undead.', itemSlot: 'hand', itemBonus: 2, itemValue: 400, elementTags: ['fire', 'undead'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Ice Wand', description: '+3 combat. Slows animals.', itemSlot: 'hand', itemBonus: 3, itemValue: 600, elementTags: ['cold', 'animal'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Poison Dagger of the Assassin', description: '+3 combat. Thief only.', itemSlot: 'hand', itemBonus: 3, itemValue: 600, classRestrict: ['thief'], elementTags: ['poison'] },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Shortbow of Surprising Damage', description: '+2 combat. 2 hands.', itemSlot: 'hand', itemBonus: 2, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Singing Sword', description: '+3 combat. Also sings during combat.', itemSlot: 'hand', itemBonus: 3, itemValue: 600, flavorText: 'La la la... STAB.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Gauntlets of Mashing', description: '+2 combat.', itemSlot: 'hand', itemBonus: 2, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Sandstorm Scimitar', description: '+3 combat.', itemSlot: 'hand', itemBonus: 3, itemValue: 600 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Legendary Stapler', description: '+1 combat. Staples things.', itemSlot: 'hand', itemBonus: 1, itemValue: 100, flavorText: 'Red. Iconic. Deadly.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Cape of Billowing', description: '+2 combat. Fashion +10.', itemSlot: 'body', itemBonus: 2, itemValue: 400 },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Enchanted Sock', description: '+1 combat. Smells mysterious.', itemSlot: 'feet', itemBonus: 1, itemValue: 100, flavorText: 'One sock. Whole power.' },
  { id: cid(), type: 'TREASURE', subtype: 'item', name: 'Tiara of Terrible Power', description: '+4 combat. Halfling only.', itemSlot: 'head', itemBonus: 4, itemValue: 800, raceRestrict: ['halfling'] },
];

// ── Gold / Level-Up (20) ──────────────────────────────────────────────────────

const goldAndLevelCards: MunchkinCard[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: cid(), type: 'TREASURE' as const, subtype: 'gold' as const,
    name: 'Gold Pieces', description: `Worth ${(i + 1) * 100} gold.`,
    itemValue: (i + 1) * 100,
    flavorText: i === 9 ? 'Now you\'re rich. Relatively.' : undefined,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: cid(), type: 'TREASURE' as const, subtype: 'level_up' as const,
    name: 'Level Up Card', description: 'Gain 1 level immediately.',
    flavorText: i === 0 ? 'Ding!' : undefined,
    itemValue: 0,
  })),
];

// ── Party Vote Cards (20) ─────────────────────────────────────────────────────

const partyVoteCards: MunchkinCard[] = [
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Pass It Left', description: 'Everyone passes their hand to the player on their left.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Pass It Right', description: 'Everyone passes their hand to the player on their right.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Show of Hands', description: 'All players reveal 1 hand card face up.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Charity Round', description: 'All players must give 1 card to the lowest-level player.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Free Market', description: 'All players may trade 1 item freely this turn.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Democracy', description: 'Vote on whether the active player has to fight or flee (majority wins).' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Group Hug', description: 'All players gain 1 hand card.', flavorText: 'Wholesome chaos.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Tax the Rich', description: 'The highest-level player gives 1 item to the lowest-level player.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Speed Round', description: 'The active player must choose all actions within 5 seconds.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Item Lottery', description: 'All players discard 1 item. Random player gets them all.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Trust Fall', description: 'Active player must ally with the most recently joined player.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Blind Bid', description: 'All players bid blind gold; highest bidder gets a bonus Treasure card.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Role Reversal', description: 'The active player swaps roles (not levels) with a random player for 1 turn.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Challenge', description: 'Two players of the group\'s choosing duel: highest card from hand wins 1 level.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Alliance Mandate', description: 'All players must form alliances (rotate paired until combat).' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Mass Discard', description: 'Everyone discards down to 3 hand cards.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Inventory Check', description: 'All players reveal their equipped items and hand cards.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Random Race', description: 'All players change to a random race for this round.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Class Swap', description: 'Random two players swap their classes for 1 round.' },
  { id: cid(), type: 'PARTY_VOTE', subtype: 'party_vote', name: 'Pandemonium', description: 'Each player draws 2 cards and discards 1 hand card.' },
];

// ── Minigame Cards (10) ───────────────────────────────────────────────────────

const minigameCards: MunchkinCard[] = [
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Speedy Fingers', description: 'Type the word shown on screen fastest. Winner gets 1 Treasure.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Dungeon Trivia', description: 'First correct trivia answer wins a Treasure. Wrong = Curse.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Click the Target', description: 'Click 5 targets in 10 seconds. Highest score wins 1 Treasure.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Memory Test', description: 'Remember 3 card names. Correct = +1 level. Wrong = Curse.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Riddle Me This', description: 'Solve the riddle in 20 seconds. Success = 2 Treasure. Fail = 1 Curse.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Speed Draw', description: 'Draw items blindly fastest. Most items wins a free equipped item.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Munchkin Jeopardy', description: 'Rules-based trivia. Correct = 1 Treasure. Wrong = lose 1 level.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Who Laughs Last', description: 'First player to laugh loses 1 level. Keep a straight face for 15 seconds.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Auction Speed Round', description: 'Instant auction — 15 seconds to bid on a random Treasure card.' },
  { id: cid(), type: 'MINIGAME', subtype: 'minigame', name: 'Rock Paper Scissors', description: 'All players play RPS. Winner gains +2 combat this round.' },
];

// ── Boss Raid Cards (5) ───────────────────────────────────────────────────────

const bossCards: MunchkinCard[] = [
  { id: cid(), type: 'DOOR', subtype: 'boss', name: 'The Elder God of Paperwork', description: 'Level 20 boss. All players fight together. Lose = all lose 1 level.', level: 20, treasureCount: 5, badStuff: 'All players lose 1 level and 1 equipped item.', elementTags: ['poison'] },
  { id: cid(), type: 'DOOR', subtype: 'boss', name: 'Bureaucratic Dragon Lord', description: 'Level 18 boss. Breathes forms. Win = all gain 1 level.', level: 18, treasureCount: 4, badStuff: 'All players lose 2 levels.', elementTags: ['fire'] },
  { id: cid(), type: 'DOOR', subtype: 'boss', name: 'Grand Chaos Poodle', description: 'Level 15 boss. Win = all gain Treasure + 1 level.', level: 15, treasureCount: 3, badStuff: 'All players lose 1 level and 500 gold.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'boss', name: 'The Final Boss Cat', description: 'Level 17 boss. Win = all gain 2 levels.', level: 17, treasureCount: 4, badStuff: 'All players lose all equipped accessories.', elementTags: ['animal'] },
  { id: cid(), type: 'DOOR', subtype: 'boss', name: 'Lich King of HR', description: 'Level 19 boss. Undead. Win = all draw 3 Treasure.', level: 19, treasureCount: 5, badStuff: 'All players lose 2 levels.', elementTags: ['undead'] },
];

// ── Export ─────────────────────────────────────────────────────────────────────

export const MUNCHKIN_DOOR_DECK: MunchkinCard[] = [
  ...monsters,
  ...curses,
  ...racesAndClasses,
  ...miscDoor,
];

export const MUNCHKIN_TREASURE_DECK: MunchkinCard[] = [
  ...items,
  ...goldAndLevelCards,
];

// ── Door Event Cards (sample — 5) ─────────────────────────────────────────────

const doorEventCards: MunchkinCard[] = [
  {
    id: cid(),
    type: 'DOOR_EVENT',
    subtype: 'door_event',
    name: 'The Zombie That Ate Your Horse',
    description: 'A zombie lurches out of the shadows — gnawing on what is unmistakably your steed.',
    flavorText: '"He didn\'t even leave the shoes."',
    situationText:
      'A groaning zombie stumbles into view. Your horse is already half-eaten. The zombie doesn\'t seem aggressive — just guilty. Do you fight, negotiate, or make peace with the loss?\n\nRoll 2d6 to see how this goes.',
    diceRollConfig: {
      diceCount: 2,
      diceType: 'd6',
      revealBeforeApply: true,
      tiers: [
        {
          key: 'critical_success',
          label: '🎉 Critical Success (12)',
          minRoll: 12,
          maxRoll: null,
          description: 'You befriend the zombie. It follows you as a loyal undead companion and returns your horse bones for +3 combat.',
          effects: [{ type: 'gain_level', amount: 1, target: 'active_player' }, { type: 'draw_treasure', amount: 2, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'success',
          label: '✅ Success (9–11)',
          minRoll: 9,
          maxRoll: 11,
          description: 'You guilt-trip the zombie into dropping a treasure item it looted from your saddlebag.',
          effects: [{ type: 'draw_treasure', amount: 1, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'partial',
          label: '⚠ Partial (6–8)',
          minRoll: 6,
          maxRoll: 8,
          description: 'The zombie shuffles away, taking one of your items with it. At least you\'re alive.',
          effects: [{ type: 'discard_item', target: 'active_player' }],
          animationType: 'neutral',
        },
        {
          key: 'fail',
          label: '❌ Fail (3–5)',
          minRoll: 3,
          maxRoll: 5,
          description: 'The zombie\'s friends show up. Lose 1 level from the overwhelming grief of horse loss.',
          effects: [{ type: 'lose_level', amount: 1, target: 'active_player' }],
          animationType: 'curse',
        },
        {
          key: 'critical_fail',
          label: '💀 Critical Fail (2)',
          minRoll: 2,
          maxRoll: 2,
          description: 'The zombie gives you a disappointed look. You drop everything and run. Lose 2 levels.',
          effects: [{ type: 'lose_level', amount: 2, target: 'active_player' }, { type: 'skip_turn', target: 'active_player' }],
          animationType: 'death',
        },
      ],
    },
  },
  {
    id: cid(),
    type: 'DOOR_EVENT',
    subtype: 'door_event',
    name: 'Dragon Rap Battle',
    description: 'A dragon blocks the path. It doesn\'t want gold. It wants bars.',
    flavorText: '"Spit or fight — your choice, adventurer."',
    situationText:
      'The dragon leans back, crosses its arms, and drops a beat with its tail.\n\n"You want to pass? Then BATTLE ME — with WORDS. Or fight me. Your call."\n\nIf the active player chooses to rap: they must freestyle for 10 seconds while their friends judge. Otherwise, treat it like a Level 8 monster fight.\n\nRoll 2d6 to see how the crowd (or the dragon) reacts.',
    diceRollConfig: {
      diceCount: 2,
      diceType: 'd6',
      revealBeforeApply: true,
      tiers: [
        {
          key: 'critical_success',
          label: '🎤 Legendary (12)',
          minRoll: 12,
          maxRoll: null,
          description: 'The dragon is moved to tears. It drops a Treasure hoard and follows you as a fan. +2 levels, draw 3 Treasure.',
          effects: [{ type: 'gain_level', amount: 2, target: 'active_player' }, { type: 'draw_treasure', amount: 3, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'success',
          label: '🔥 Fire Spitter (9–11)',
          minRoll: 9,
          maxRoll: 11,
          description: 'The dragon nods, impressed. It lets you pass and slides you a Treasure for the effort.',
          effects: [{ type: 'gain_level', amount: 1, target: 'active_player' }, { type: 'draw_treasure', amount: 1, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'partial',
          label: '😬 Mid (6–8)',
          minRoll: 6,
          maxRoll: 8,
          description: 'The dragon cringes but respects the effort. You pass, no reward, no punishment.',
          effects: [],
          animationType: 'neutral',
        },
        {
          key: 'fail',
          label: '😤 Trash Talk Backfired (3–5)',
          minRoll: 3,
          maxRoll: 5,
          description: 'The dragon LAUGHS. Everyone loses 1 level from secondhand embarrassment.',
          effects: [{ type: 'lose_level', amount: 1, target: 'all' }],
          animationType: 'curse',
        },
        {
          key: 'critical_fail',
          label: '💀 Absolute Disaster (2)',
          minRoll: 2,
          maxRoll: 2,
          description: 'The dragon calls its friends. The dragon and two of its buddies now fight the whole party. Active player loses 2 levels immediately.',
          effects: [{ type: 'lose_level', amount: 2, target: 'active_player' }],
          animationType: 'death',
        },
      ],
    },
  },
  {
    id: cid(),
    type: 'DOOR_EVENT',
    subtype: 'door_event',
    name: 'Mysterious Merchant',
    description: 'A hooded figure offers you a deal. It could be incredible. Or terrible.',
    flavorText: '"No refunds. No exchanges. No eye contact."',
    situationText:
      'A merchant materializes from the shadows. Their cart is covered by a velvet cloth. "One item," they rasp. "You pick blind. Roll the dice. Fate decides the quality."\n\nRoll 2d6 to see what you get.',
    diceRollConfig: {
      diceCount: 2,
      diceType: 'd6',
      revealBeforeApply: true,
      tiers: [
        {
          key: 'critical_success',
          label: '✨ Legendary Item (12)',
          minRoll: 12,
          maxRoll: null,
          description: 'You pull out a legendary artifact. Draw 3 Treasure cards and keep the best one.',
          effects: [{ type: 'draw_treasure', amount: 3, target: 'active_player' }, { type: 'gain_level', amount: 1, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'success',
          label: '⚔ Good Item (9–11)',
          minRoll: 9,
          maxRoll: 11,
          description: 'Solid item. Draw 2 Treasure cards.',
          effects: [{ type: 'draw_treasure', amount: 2, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'partial',
          label: '📦 Mediocre Item (6–8)',
          minRoll: 6,
          maxRoll: 8,
          description: 'Draw 1 Treasure card. It\'s fine.',
          effects: [{ type: 'draw_treasure', amount: 1, target: 'active_player' }],
          animationType: 'neutral',
        },
        {
          key: 'fail',
          label: '🐀 Cursed Junk (3–5)',
          minRoll: 3,
          maxRoll: 5,
          description: 'The item crumbles to dust. Lose 200 gold.',
          effects: [{ type: 'lose_gold', amount: 200, target: 'active_player' }],
          animationType: 'curse',
        },
        {
          key: 'critical_fail',
          label: '💀 Trapped Box (2)',
          minRoll: 2,
          maxRoll: 2,
          description: 'It explodes. Lose 1 level and discard 1 equipped item.',
          effects: [{ type: 'lose_level', amount: 1, target: 'active_player' }, { type: 'discard_item', target: 'active_player' }],
          animationType: 'death',
        },
      ],
    },
  },
  {
    id: cid(),
    type: 'DOOR_EVENT',
    subtype: 'door_event',
    name: 'Tavern Brawl',
    description: 'You walk into a bar fight already in progress. Everyone looks at you.',
    flavorText: '"They started it. Allegedly."',
    situationText:
      'The tavern erupts. Mugs are flying. Two orcs are arm-wrestling over a goat. A wizard is being used as a projectile.\n\nYou can join the chaos, try to stop it, or slowly back out.\n\nRoll 2d6.',
    diceRollConfig: {
      diceCount: 2,
      diceType: 'd6',
      revealBeforeApply: true,
      tiers: [
        {
          key: 'critical_success',
          label: '🏆 Brawl Champion (12)',
          minRoll: 12,
          maxRoll: null,
          description: 'You single-handedly end the brawl. The whole tavern buys you a round. +2 levels, draw 2 Treasure.',
          effects: [{ type: 'gain_level', amount: 2, target: 'active_player' }, { type: 'draw_treasure', amount: 2, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'success',
          label: '✅ Decent Showing (9–11)',
          minRoll: 9,
          maxRoll: 11,
          description: 'You hold your own and walk out with a stolen treasure from someone\'s pocket.',
          effects: [{ type: 'gain_level', amount: 1, target: 'active_player' }, { type: 'draw_treasure', amount: 1, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'partial',
          label: '😅 Barely Escaped (6–8)',
          minRoll: 6,
          maxRoll: 8,
          description: 'You escape with a bump on your head. No reward, no punishment.',
          effects: [],
          animationType: 'neutral',
        },
        {
          key: 'fail',
          label: '🤕 Got Hit (3–5)',
          minRoll: 3,
          maxRoll: 5,
          description: 'A flying mug catches you square in the face. Lose 1 level.',
          effects: [{ type: 'lose_level', amount: 1, target: 'active_player' }],
          animationType: 'curse',
        },
        {
          key: 'critical_fail',
          label: '💀 You Started It (2)',
          minRoll: 2,
          maxRoll: 2,
          description: 'The entire tavern turns against you. Lose 2 levels and skip your next turn.',
          effects: [{ type: 'lose_level', amount: 2, target: 'active_player' }, { type: 'skip_turn', target: 'active_player' }],
          animationType: 'death',
        },
      ],
    },
  },
  {
    id: cid(),
    type: 'DOOR_EVENT',
    subtype: 'door_event',
    name: 'The Oracle\'s Riddle',
    description: 'An oracle blocks your path. Answer correctly and prosper. Fail and suffer.',
    flavorText: '"I have teeth but cannot eat. I have a face but no eyes. I have hands but no arms."',
    situationText:
      'A shimmering oracle floats before you.\n\n"Answer my riddle, adventurer, and I shall grant you great power. Fail, and I shall take what\'s most precious."\n\nThe oracle poses a riddle of your GM\'s choosing. The party votes on the answer. Roll to see how fate regards your attempt.',
    diceRollConfig: {
      diceCount: 2,
      diceType: 'd6',
      revealBeforeApply: true,
      tiers: [
        {
          key: 'critical_success',
          label: '🔮 Wisdom Incarnate (12)',
          minRoll: 12,
          maxRoll: null,
          description: 'The oracle is astounded. Entire party gains 1 level.',
          effects: [{ type: 'gain_level', amount: 1, target: 'all' }, { type: 'draw_treasure', amount: 2, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'success',
          label: '✅ Correct (9–11)',
          minRoll: 9,
          maxRoll: 11,
          description: 'The oracle nods, grants you a Treasure and +1 level.',
          effects: [{ type: 'gain_level', amount: 1, target: 'active_player' }, { type: 'draw_treasure', amount: 1, target: 'active_player' }],
          animationType: 'celebrate',
        },
        {
          key: 'partial',
          label: '🤔 Close Enough (6–8)',
          minRoll: 6,
          maxRoll: 8,
          description: 'The oracle sighs and lets you pass with a warning glare.',
          effects: [],
          animationType: 'neutral',
        },
        {
          key: 'fail',
          label: '❌ Wrong (3–5)',
          minRoll: 3,
          maxRoll: 5,
          description: 'The oracle shakes its head. Lose 1 level.',
          effects: [{ type: 'lose_level', amount: 1, target: 'active_player' }],
          animationType: 'curse',
        },
        {
          key: 'critical_fail',
          label: '💀 Catastrophically Wrong (2)',
          minRoll: 2,
          maxRoll: 2,
          description: 'The oracle laughs and curses the whole party. Everyone loses 1 level.',
          effects: [{ type: 'lose_level', amount: 1, target: 'all' }],
          animationType: 'death',
        },
      ],
    },
  },
];

export const MUNCHKIN_PARTY_VOTE_DECK: MunchkinCard[] = partyVoteCards;
export const MUNCHKIN_MINIGAME_CARDS: MunchkinCard[] = minigameCards;
export const MUNCHKIN_BOSS_CARDS: MunchkinCard[] = bossCards;
export const MUNCHKIN_DOOR_EVENT_CARDS: MunchkinCard[] = doorEventCards;

export const ALL_MUNCHKIN_CARDS: MunchkinCard[] = [
  ...MUNCHKIN_DOOR_DECK,
  ...MUNCHKIN_TREASURE_DECK,
  ...MUNCHKIN_PARTY_VOTE_DECK,
  ...MUNCHKIN_MINIGAME_CARDS,
  ...MUNCHKIN_BOSS_CARDS,
  ...MUNCHKIN_DOOR_EVENT_CARDS,
];
