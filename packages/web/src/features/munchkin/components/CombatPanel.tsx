import { useState } from 'react';
import { motion } from 'motion/react';
import type { CombatState, PlayerState } from '@homekit/engine';
import { DiceRoll } from './DiceRoll';

interface CombatPanelProps {
  combatStack: CombatState;
  players: Record<string, PlayerState>;
  myPlayerId: string;
  isActivePlayer: boolean;
  onFight: () => void;
  onFlee: () => void;
  onHelp: (powerBonus: number, rewardShare: number) => void;
}

export function CombatPanel({
  combatStack,
  players,
  myPlayerId,
  isActivePlayer,
  onFight,
  onFlee,
  onHelp,
}: CombatPanelProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [helpBonus, setHelpBonus] = useState(2);
  const [showDice, setShowDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  const monster = combatStack.monster;
  const monsterPower = combatStack.monsterPower +
    combatStack.extraMonsters.reduce((s, m) => s + (m.level ?? 0), 0) +
    combatStack.hinderCards.reduce((s, c) => s + (c.itemBonus ?? 0), 0);

  const activePlayer = players[combatStack.playerIds[0]];
  const playerPower = (activePlayer?.power ?? 0) +
    combatStack.helpOffers.reduce((s, h) => s + h.powerBonus, 0);

  const isParticipant = combatStack.playerIds.includes(myPlayerId);
  const isHelper = !isActivePlayer && !isParticipant;

  const handleFlee = () => {
    setShowDice(true);
    const result = Math.floor(Math.random() * 6) + 1;
    setDiceResult(result);
    setTimeout(() => {
      setShowDice(false);
      setDiceResult(null);
      onFlee();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-950/40 p-4 backdrop-blur-sm"
    >
      <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-red-400">
        ⚔ Combat!
      </h2>

      {/* Power comparison */}
      <div className="mb-4 flex items-center justify-center gap-6 text-center">
        <div>
          <p className="text-xs text-white/50">You</p>
          <p className="text-3xl font-bold text-green-400">{playerPower}</p>
          <p className="text-xs text-white/40">power</p>
        </div>
        <div className="text-2xl">⚔</div>
        <div>
          <p className="text-xs text-white/50">{monster.name}</p>
          <p className="text-3xl font-bold text-red-400">{monsterPower}</p>
          <p className="text-xs text-white/40">Lv.{monster.level}</p>
        </div>
      </div>

      {monster.badStuff && (
        <p className="mb-3 text-center text-xs text-red-300/70">
          Bad stuff: {monster.badStuff}
        </p>
      )}

      {/* Help offers */}
      {combatStack.helpOffers.length > 0 && (
        <div className="mb-3 flex flex-wrap justify-center gap-1">
          {combatStack.helpOffers.map((h) => (
            <span key={h.fromPlayerId} className="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-300">
              +{h.powerBonus} from {players[h.fromPlayerId]?.name ?? h.fromPlayerId}
            </span>
          ))}
        </div>
      )}

      {/* Active player actions */}
      {isActivePlayer && (
        <div className="flex justify-center gap-2">
          <button
            onClick={onFight}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 transition"
          >
            Fight!
          </button>
          <button
            onClick={handleFlee}
            className="rounded-xl bg-gray-700 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-600 transition"
          >
            Run Away!
          </button>
        </div>
      )}

      {/* Helper actions */}
      {isHelper && !showHelp && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="rounded-xl bg-green-700/60 px-4 py-2 text-xs font-semibold text-green-300 hover:bg-green-700"
          >
            Help Player
          </button>
        </div>
      )}

      {isHelper && showHelp && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-white/60">Bonus:</span>
          <input
            type="number"
            value={helpBonus}
            min={1}
            max={10}
            onChange={(e) => setHelpBonus(parseInt(e.target.value, 10))}
            className="w-14 rounded bg-black/30 px-2 py-1 text-center text-sm text-white border border-white/20"
          />
          <button
            onClick={() => { onHelp(helpBonus, 1); setShowHelp(false); }}
            className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Confirm Help
          </button>
          <button onClick={() => setShowHelp(false)} className="text-xs text-white/40">
            Cancel
          </button>
        </div>
      )}

      {/* Dice roll animation */}
      {showDice && (
        <div className="mt-3 flex justify-center">
          <DiceRoll result={diceResult} />
        </div>
      )}
    </motion.div>
  );
}
