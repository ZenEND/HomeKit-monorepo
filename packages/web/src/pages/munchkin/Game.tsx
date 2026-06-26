import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useUserStore } from '@/store/useUserStore';
import { useGameSocket } from '@/features/munchkin/hooks/useGameSocket';
import {
  useActivePlayerId,
  useAllPlayers,
  useCombatStack,
  useEventLog,
  useGameStore,
  useMyHand,
  usePhase,
} from '@/features/munchkin/hooks/useGameState';
import { PlayerSeat } from '@/features/munchkin/components/PlayerSeat';
import { CardHand } from '@/features/munchkin/components/CardHand';
import { CombatPanel } from '@/features/munchkin/components/CombatPanel';
import { PhasePanel } from '@/features/munchkin/components/PhasePanel';
import { EventLog } from '@/features/munchkin/components/EventLog';
import { LevelUpCelebration } from '@/features/munchkin/components/LevelUpCelebration';
import { EffectOverlay } from '@/features/munchkin/components/EffectOverlay';
import { DoorEventOverlay } from '@/features/munchkin/components/DoorEventOverlay';
import type { AnimationTrigger, MunchkinAction, MunchkinCard } from '@homekit/engine';

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const user = useUserStore((s) => s.user);
  const myPlayerId = user?.id ?? 'guest';
  const playerName = user?.email?.split('@')[0] ?? 'Player';

  const [levelUpPlayer, setLevelUpPlayer] = useState<string | null>(null);
  const [activeEffect, setActiveEffect] = useState<AnimationTrigger | null>(null);

  const { sendAction, reconnect } = useGameSocket({
    roomId,
    playerId: myPlayerId,
    playerName,
    onAnimationTrigger: (trigger) => {
      setActiveEffect(trigger);
      if (trigger.type === 'level_up') {
        setLevelUpPlayer(trigger.targetPlayerId ?? null);
        setTimeout(() => setLevelUpPlayer(null), 2500);
      }
      setTimeout(() => setActiveEffect(null), 2000);
    },
  });

  const state = useGameStore((s) => s.state);
  const phase = usePhase();
  const activePlayerId = useActivePlayerId();
  const allPlayers = useAllPlayers();
  const myHand = useMyHand(myPlayerId);
  const combatStack = useCombatStack();
  const eventLog = useEventLog();
  const isMyTurn = activePlayerId === myPlayerId;

  useEffect(() => {
    if (roomId) reconnect(roomId);
  }, [roomId, reconnect]);

  const handleAction = (action: MunchkinAction) => {
    if (roomId) sendAction(roomId, action);
  };

  if (!state || !phase) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-tertiary">Connecting to game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0a0a0f] text-white select-none">
      {/* Background felt texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a2a1a_0%,_#0a0a0f_70%)] opacity-80" />

      {/* Effect overlay (particles) */}
      <AnimatePresence>
        {activeEffect && (
          <EffectOverlay trigger={activeEffect} />
        )}
      </AnimatePresence>

      {/* Level up celebration */}
      <AnimatePresence>
        {levelUpPlayer && (
          <LevelUpCelebration
            playerName={state.players[levelUpPlayer]?.name ?? 'Player'}
            newLevel={state.players[levelUpPlayer]?.level ?? 1}
          />
        )}
      </AnimatePresence>

      {/* Door Event overlay */}
      <AnimatePresence>
        {phase === 'DOOR_EVENT' && state.diceRollState && (
          <DoorEventOverlay
            diceRollState={state.diceRollState}
            isActivePlayer={isMyTurn}
            onRoll={() => handleAction({ type: 'ROLL_DICE' })}
            onResolve={() => handleAction({ type: 'RESOLVE_DOOR_EVENT' })}
          />
        )}
      </AnimatePresence>

      {/* Player seats row */}
      <div className="relative z-10 flex items-center justify-center gap-4 p-4 pt-6">
        {allPlayers.map((player) => (
          <PlayerSeat
            key={player.id}
            player={player}
            isActive={player.id === activePlayerId}
            isMe={player.id === myPlayerId}
          />
        ))}
      </div>

      {/* Table center */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-4">
        {/* Phase indicator */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-brand-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-secondary">
            {phase.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-tertiary">Round {state.round}</span>
          {isMyTurn && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400"
            >
              Your Turn
            </motion.span>
          )}
        </div>

        {/* Combat panel */}
        <AnimatePresence>
          {phase === 'COMBAT' && combatStack && (
            <CombatPanel
              combatStack={combatStack}
              players={state.players}
              myPlayerId={myPlayerId}
              isActivePlayer={isMyTurn}
              onFight={() => handleAction({ type: 'FIGHT' })}
              onFlee={() => handleAction({ type: 'FLEE' })}
              onHelp={(powerBonus, rewardShare) =>
                handleAction({
                  type: 'HELP',
                  targetPlayerId: activePlayerId ?? '',
                  powerBonus,
                  rewardShare,
                })
              }
            />
          )}
        </AnimatePresence>

        {/* Phase actions (non-combat) */}
        {phase !== 'COMBAT' && (
          <PhasePanel
            phase={phase}
            isActivePlayer={isMyTurn}
            onAction={handleAction}
          />
        )}

        {/* Table cards */}
        {state.tableCards.length > 0 && (
          <div className="flex gap-2">
            {state.tableCards.slice(-5).map((card) => (
              <div
                key={card.id}
                className="flex h-20 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-center text-xs text-white/60"
              >
                <span>{card.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My hand */}
      <div className="relative z-10 pb-4">
        <CardHand
          cards={myHand}
          onPlayCard={(card) => handleAction({ type: 'PLAY_CARD', cardId: card.id })}
          onEquipItem={(card) => handleAction({ type: 'EQUIP_ITEM', cardId: card.id })}
          disabled={!isMyTurn}
        />
      </div>

      {/* Event log ticker */}
      <EventLog events={eventLog} />
    </div>
  );
}
