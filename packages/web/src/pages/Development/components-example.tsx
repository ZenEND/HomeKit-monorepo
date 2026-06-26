import { useState } from 'react';
import {
  ArrowRight,
  Bell01,
  Check,
  Grid01,
  List,
  Plus,
  Settings01,
  User01,
} from '@untitledui/icons';
import { FileIcon } from '@untitledui/file-icons';
import { motion } from 'motion/react';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';
import { Avatar } from '@/components/base/avatar/avatar';
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/base/card/card';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { MediaUploadDropdown } from '@/components/files/media-upload-dropdown';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Tag, TagGroup, TagList } from '@/components/base/tags/tags';
import { Toggle } from '@/components/base/toggle/toggle';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useTranslation } from '@/lib/i18n/use-translation';

const teamMembers = [
  { id: '1', label: 'Olivia Rhye', supportingText: 'olivia@homekit.dev' },
  { id: '2', label: 'Phoenix Baker', supportingText: 'phoenix@homekit.dev' },
  { id: '3', label: 'Lana Steiner', supportingText: 'lana@homekit.dev' },
];

const fileIconTypes = ['folder', 'pdf', 'docx', 'xlsx', 'jpg', 'png', 'mp4', 'mp3', 'zip', 'json'] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-display-xs font-semibold text-primary">{title}</h2>
        <p className="mt-1 text-md text-tertiary">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function ComponentsExample() {
  const { language } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnimatedCard, setShowAnimatedCard] = useState(true);

  const handleDemoUpload = async (file: File) => {
    console.log('Demo upload:', file.name);
  };

  const handleMockSubmit = () => {
    setIsSubmitting(true);
    window.setTimeout(() => setIsSubmitting(false), 1500);
  };

  const ui = language === 'ua'
    ? {
        title: 'Приклади компонентів',
        subtitle:
          'Вітрина базових компонентів Untitled UI, які використовуються в HomeKit — картки, групи, бейджі, аватари, теги, перемикачі й форми.',
        cards: 'Картки',
        cardsDescription: 'Компонована структура карток для групування повʼязаного контенту та дій.',
        deviceOverview: 'Огляд пристроїв',
        deviceDescription: '3 пристрої онлайн, 1 офлайн',
        livingRoom: 'Вітальня',
        kitchen: 'Кухня',
        garage: 'Гараж',
        viewAll: 'Переглянути все',
        manage: 'Керувати',
        quickActions: 'Швидкі дії',
        quickActionsDescription: 'Типові задачі для твого розумного дому',
        addDevice: 'Додати пристрій',
        configureAlerts: 'Налаштувати сповіщення',
        buttonGroups: 'Групи кнопок',
        buttonGroupsDescription: 'Сегментовані контролери для перемикання між повʼязаними виглядами.',
        grid: 'Сітка',
        list: 'Список',
        buttonsBadges: 'Кнопки та бейджі',
        buttonsBadgesDescription: 'Основні дії та індикатори статусу.',
        primary: 'Основна',
        secondary: 'Вторинна',
        tertiary: 'Третинна',
        link: 'Посилання',
        new: 'Нове',
        active: 'Активно',
        pending: 'Очікує',
        offline: 'Офлайн',
        avatars: 'Аватари',
        avatarsDescription: 'Ідентичність користувача зі статусом і групами підписів.',
        tags: 'Теги',
        tagsDescription: 'Фільтри-чіпи та знімні мітки.',
        rooms: 'Кімнати',
        bedroom: 'Спальня',
        office: 'Офіс',
        loading: 'Індикатори завантаження',
        loadingDescription: 'Вбудовані спінери для async-станів і переходів сторінок.',
        loadingLabel: 'Завантаження...',
        saveChanges: 'Зберегти зміни',
        submit: 'Надіслати',
        animations: 'Анімації',
        animationsDescription: 'Ефекти входу Motion і утиліти tailwindcss-animate.',
        hideCard: 'Сховати картку',
        showCard: 'Показати картку',
        animatedText:
          'Ця картка зʼявляється через fade і slide за допомогою Motion, поверх додано tailwindcss-animate fade-in.',
        fileIcons: 'Іконки файлів',
        fileIconsDescription: '@untitledui/file-icons для сховища й типів документів.',
        uploadDropdown: 'Dropdown завантаження',
        uploadDropdownDescription: 'Перетягування, вставка з буфера, вибір файлів і обрізка зображень перед завантаженням.',
        uploadFile: 'Завантажити файл',
        formControls: 'Елементи форм',
        formControlsDescription: 'Поля вводу, селекти, перемикачі та чекбокси.',
        deviceName: 'Назва пристрою',
        devicePlaceholder: 'напр. лампа у вітальні',
        deviceHint: 'Обери назву, яку легко впізнати в застосунку.',
        assignedTo: 'Призначено',
        selectMember: 'Обери учасника',
        pushNotifications: 'Push-сповіщення',
        pushHint: 'Отримувати сповіщення, коли пристрій переходить офлайн',
        shareHousehold: 'Поділитися з домом',
        shareHint: 'Дозволити іншим учасникам керувати цим пристроєм',
        cancel: 'Скасувати',
        saveDevice: 'Зберегти пристрій',
      }
    : {
        title: 'Component examples',
        subtitle:
          'A showcase of Untitled UI base components used in HomeKit — cards, groups, badges, avatars, tags, toggles, and form controls.',
        cards: 'Cards',
        cardsDescription: 'Composable card layout for grouping related content and actions.',
        deviceOverview: 'Device overview',
        deviceDescription: '3 devices online, 1 offline',
        livingRoom: 'Living room',
        kitchen: 'Kitchen',
        garage: 'Garage',
        viewAll: 'View all',
        manage: 'Manage',
        quickActions: 'Quick actions',
        quickActionsDescription: 'Common tasks for your smart home',
        addDevice: 'Add device',
        configureAlerts: 'Configure alerts',
        buttonGroups: 'Button groups',
        buttonGroupsDescription: 'Segmented controls for switching between related views.',
        grid: 'Grid',
        list: 'List',
        buttonsBadges: 'Buttons & badges',
        buttonsBadgesDescription: 'Primary actions and status indicators.',
        primary: 'Primary',
        secondary: 'Secondary',
        tertiary: 'Tertiary',
        link: 'Link',
        new: 'New',
        active: 'Active',
        pending: 'Pending',
        offline: 'Offline',
        avatars: 'Avatars',
        avatarsDescription: 'User identity with status and label groups.',
        tags: 'Tags',
        tagsDescription: 'Filter chips and removable labels.',
        rooms: 'Rooms',
        bedroom: 'Bedroom',
        office: 'Office',
        loading: 'Loading indicators',
        loadingDescription: 'Built-in spinners for async states and page transitions.',
        loadingLabel: 'Loading...',
        saveChanges: 'Save changes',
        submit: 'Submit',
        animations: 'Animations',
        animationsDescription: 'Motion entrance effects and tailwindcss-animate utilities.',
        hideCard: 'Hide card',
        showCard: 'Show card',
        animatedText:
          'This card fades and slides in using Motion, with tailwindcss-animate fade-in layered on top.',
        fileIcons: 'File icons',
        fileIconsDescription: '@untitledui/file-icons for storage and document types.',
        uploadDropdown: 'Upload dropdown',
        uploadDropdownDescription: 'Drop, paste from clipboard, browse, and crop images before upload.',
        uploadFile: 'Upload file',
        formControls: 'Form controls',
        formControlsDescription: 'Inputs, selects, toggles, and checkboxes.',
        deviceName: 'Device name',
        devicePlaceholder: 'e.g. Living room lamp',
        deviceHint: "Choose a name you'll recognize in the app.",
        assignedTo: 'Assigned to',
        selectMember: 'Select a member',
        pushNotifications: 'Push notifications',
        pushHint: 'Get alerts when a device goes offline',
        shareHousehold: 'Share with household',
        shareHint: 'Allow other members to control this device',
        cancel: 'Cancel',
        saveDevice: 'Save device',
      };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-10">
      <header className="flex flex-col gap-3">
        <FeaturedIcon icon={Settings01} color="brand" theme="light" size="lg" />
        <h1 className="text-display-sm font-semibold text-primary">{ui.title}</h1>
        <p className="max-w-2xl text-md text-tertiary">{ui.subtitle}</p>
      </header>

      <Section
        title={ui.cards}
        description={ui.cardsDescription}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{ui.deviceOverview}</CardTitle>
              <CardDescription>{ui.deviceDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <BadgeWithDot color="success" type="pill-color">
                  {ui.livingRoom}
                </BadgeWithDot>
                <BadgeWithDot color="success" type="pill-color">
                  {ui.kitchen}
                </BadgeWithDot>
                <BadgeWithDot color="gray" type="pill-color">
                  {ui.garage}
                </BadgeWithDot>
              </div>
            </CardContent>
            <CardFooter>
              <Button color="secondary" size="sm">
                {ui.viewAll}
              </Button>
              <Button size="sm" iconTrailing={ArrowRight}>
                {ui.manage}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{ui.quickActions}</CardTitle>
              <CardDescription>{ui.quickActionsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button iconLeading={Plus} color="secondary" size="md" className="w-full">
                {ui.addDevice}
              </Button>
              <Button iconLeading={Bell01} color="tertiary" size="md" className="w-full">
                {ui.configureAlerts}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title={ui.buttonGroups}
        description={ui.buttonGroupsDescription}
      >
        <ButtonGroup
          selectedKeys={[viewMode]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            if (selected === 'grid' || selected === 'list') {
              setViewMode(selected);
            }
          }}
        >
          <ButtonGroupItem id="grid" iconLeading={Grid01}>
            {ui.grid}
          </ButtonGroupItem>
          <ButtonGroupItem id="list" iconLeading={List}>
            {ui.list}
          </ButtonGroupItem>
        </ButtonGroup>
      </Section>

      <Section title={ui.buttonsBadges} description={ui.buttonsBadgesDescription}>
        <div className="flex flex-wrap items-center gap-3">
          <Button color="primary" iconLeading={Check}>
            {ui.primary}
          </Button>
          <Button color="secondary">{ui.secondary}</Button>
          <Button color="tertiary">{ui.tertiary}</Button>
          <Button color="link-color" href="/login">
            {ui.link}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge color="brand" size="md">
            {ui.new}
          </Badge>
          <Badge color="success" size="md">
            {ui.active}
          </Badge>
          <Badge color="warning" size="md">
            {ui.pending}
          </Badge>
          <Badge color="error" size="md">
            {ui.offline}
          </Badge>
        </div>
      </Section>

      <Section title={ui.avatars} description={ui.avatarsDescription}>
        <div className="flex flex-wrap items-center gap-6">
          <Avatar initials="HK" size="lg" status="online" />
          <Avatar initials="OR" size="lg" verified />
          <AvatarLabelGroup
            initials="OM"
            title="Oleg Maksimenko"
            subtitle="Admin · oleg@homekit.dev"
            size="md"
            status="online"
          />
        </div>
      </Section>

      <Section title={ui.tags} description={ui.tagsDescription}>
        <TagGroup label={ui.rooms}>
          <TagList className="flex flex-wrap gap-2">
            <Tag id="living-room">{ui.livingRoom}</Tag>
            <Tag id="bedroom" dot>
              {ui.bedroom}
            </Tag>
            <Tag id="office" count={4}>
              {ui.office}
            </Tag>
          </TagList>
        </TagGroup>
      </Section>

      <Section
        title={ui.loading}
        description={ui.loadingDescription}
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <LoadingIndicator type="line-simple" size="md" />
              <p className="text-xs text-tertiary">line-simple</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <LoadingIndicator type="line-spinner" size="md" label={ui.loadingLabel} />
              <p className="text-xs text-tertiary">line-spinner</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <LoadingIndicator type="dot-circle" size="lg" />
              <p className="text-xs text-tertiary">dot-circle</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button isLoading={isSubmitting} showTextWhileLoading onClick={handleMockSubmit}>
            {ui.saveChanges}
          </Button>
          <Button color="secondary" isLoading={isSubmitting}>
            {ui.submit}
          </Button>
        </div>
      </Section>

      <Section
        title={ui.animations}
        description={ui.animationsDescription}
      >
        <div className="flex flex-wrap gap-3">
          <Button color="secondary" onClick={() => setShowAnimatedCard(false)}>
            {ui.hideCard}
          </Button>
          <Button onClick={() => setShowAnimatedCard(true)}>{ui.showCard}</Button>
        </div>
        {showAnimatedCard && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Card className="animate-in fade-in duration-300">
              <CardContent>
                <p className="text-sm text-secondary">
                  {ui.animatedText}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </Section>

      <Section
        title={ui.fileIcons}
        description={ui.fileIconsDescription}
      >
        <div className="grid grid-cols-5 gap-4 sm:grid-cols-10">
          {fileIconTypes.map((type) => (
            <div
              key={type}
              className="flex flex-col items-center gap-2 rounded-lg border border-secondary bg-primary p-3 transition duration-100 ease-linear hover:bg-primary_hover"
            >
              <FileIcon type={type} size={32} />
              <span className="text-xs text-tertiary">{type}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title={ui.uploadDropdown}
        description={ui.uploadDropdownDescription}
      >
        <MediaUploadDropdown label={ui.uploadFile} onUpload={handleDemoUpload} />
      </Section>

      <Section title={ui.formControls} description={ui.formControlsDescription}>
        <Card>
          <CardContent className="flex flex-col gap-5">
            <Input
              label={ui.deviceName}
              placeholder={ui.devicePlaceholder}
              icon={Settings01}
              hint={ui.deviceHint}
            />

            <Select
              label={ui.assignedTo}
              placeholder={ui.selectMember}
              icon={User01}
              items={teamMembers}
            >
              {(item) => (
                <Select.Item id={item.id} supportingText={item.supportingText}>
                  {item.label}
                </Select.Item>
              )}
            </Select>

            <Toggle
              label={ui.pushNotifications}
              hint={ui.pushHint}
              isSelected={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />

            <Checkbox label={ui.shareHousehold} hint={ui.shareHint} />
          </CardContent>
          <CardFooter>
            <Button color="secondary">{ui.cancel}</Button>
            <Button iconLeading={Check}>{ui.saveDevice}</Button>
          </CardFooter>
        </Card>
      </Section>
    </div>
  );
}
