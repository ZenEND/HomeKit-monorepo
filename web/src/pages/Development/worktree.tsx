import { GitBranch01, Star01 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { Badge } from '@/components/base/badges/badges';
import { Card, CardContent } from '@/components/base/card/card';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  badgeForEffort,
  badgeForImpact,
  localizeWorktreeBranch,
  worktreeBranches,
  type WorktreeVariant,
} from '@/lib/worktree/worktree-data';
import { cx } from '@/utils/cx';

function VariantCard({ variant }: { variant: WorktreeVariant }) {
  const { t } = useTranslation();

  return (
    <Card className={cx(variant.recommended && 'ring-2 ring-brand-solid')}>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-primary">{variant.title}</p>
          {variant.recommended && (
            <Badge color="brand" size="sm" className="flex items-center gap-1">
              <Star01 className="size-3" aria-hidden="true" />
              {t('worktree.pick')}
            </Badge>
          )}
        </div>
        <p className="text-sm text-tertiary">{variant.description}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge color={badgeForImpact(variant.impact)} size="sm">
            {t(`common.${variant.impact}`)} {t('common.impact')}
          </Badge>
          <Badge color={badgeForEffort(variant.effort)} size="sm">
            {t(`common.${variant.effort}`)} {t('common.effort')}
          </Badge>
        </div>
        <p className="text-xs text-quaternary">
          <span className="font-medium text-tertiary">{t('common.learn')}:</span> {variant.learn}
        </p>
      </CardContent>
    </Card>
  );
}

export function Worktree() {
  const { t, language } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <FeaturedIcon icon={GitBranch01} color="brand" theme="gradient" size="lg" />
        <div>
          <h1 className="text-display-sm font-semibold text-primary">{t('worktree.title')}</h1>
          <p className="mt-2 max-w-2xl text-md text-tertiary">{t('worktree.subtitle')}</p>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        {worktreeBranches.map((branch, bi) => {
          const localized = localizeWorktreeBranch(branch, language);
          return (
          <motion.section
            key={localized.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: bi * 0.05, ease: 'easeOut' }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-start gap-3 border-l-2 border-brand-solid pl-4">
              <span className="text-2xl" aria-hidden="true">
                {localized.emoji}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary">{localized.area}</h2>
                <p className="text-sm text-tertiary">{localized.goal}</p>
              </div>
              <Badge color="gray" size="sm" className="ml-auto">
                {localized.variants.length} {t('worktree.variants')}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {localized.variants.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          </motion.section>
          );
        })}
      </div>
    </div>
  );
}
