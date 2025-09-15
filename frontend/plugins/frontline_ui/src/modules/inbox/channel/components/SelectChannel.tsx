import { IChannel } from '@/inbox/types/Channel';
import {
  SelectChannelContext,
  useSelectChannelContext,
} from '@/inbox/channel/context/SelectChannelContext';
import { useState } from 'react';
import { ChannelsInline } from './ChannelsInline';
import { useDebounce } from 'use-debounce';
import { cn, Combobox, Command, Form, Popover } from 'erxes-ui';
import { useChannels } from '../hooks/useChannels';

const SelectChannelProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
}) => {
  const [channels, setChannels] = useState<IChannel[]>([]);
  const isSingleMode = mode === 'single';

  const onSelect = (channel: IChannel) => {
    if (!channel) {
      return;
    }

    if (isSingleMode) {
      setChannels([channel]);
      return onValueChange?.(channel._id);
    }
    const arrayValue = Array.isArray(value) ? value : [];

    const isChannelSelected = arrayValue.includes(channel._id);
    const newSelectedChannelIds = isChannelSelected
      ? arrayValue.filter((id) => id !== channel._id)
      : [...arrayValue, channel._id];

    setChannels(channels.filter((c) => newSelectedChannelIds.includes(c._id)));
    onValueChange?.(newSelectedChannelIds);
  };

  return (
    <SelectChannelContext.Provider
      value={{
        channels,
        setChannels,
        channelIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        loading: false,
        error: null,
      }}
    >
      {children}
    </SelectChannelContext.Provider>
  );
};

const SelectChannelsValue = () => {
  const { channels, channelIds, setChannels } = useSelectChannelContext();

  return (
    <ChannelsInline
      channels={channels}
      channelIds={channelIds}
      updateChannels={setChannels}
    />
  );
};

export const SelectChannelsContent = () => {
  const { channelIds, onSelect } = useSelectChannelContext();
  const {
    channels: channelsData,
    loading,
    error,
    handleFetchMore,
    channelsTotalCount,
  } = useChannels();

  return (
    <Command shouldFilter={false}>
      <Command.Input
        variant="secondary"
        focusOnMount
        placeholder="Search channels"
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {channelsData && channelsData?.length > 0 && (
          <>
            {channelsData.map((channel) => (
              <Command.Item
                key={channel._id}
                value={channel._id}
                onSelect={() => {
                  onSelect(channel);
                }}
              >
                {channel.name}
                <Combobox.Check checked={channelIds.includes(channel._id)} />
              </Command.Item>
            ))}

            <Combobox.FetchMore
              fetchMore={handleFetchMore}
              currentLength={channelsData.length}
              totalCount={channelsTotalCount || 0}
            />
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const SelectChannelsFormItem = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectChannelProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectChannelProvider
      {...props}
      onValueChange={(value) => {
        props.mode === 'single' && setOpen(false);
        props.onValueChange?.(value);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full', className)}>
            <SelectChannelsValue />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectChannelsContent />
        </Combobox.Content>
      </Popover>
    </SelectChannelProvider>
  );
};

export const SelectChannelFilterItem = () => {
  return (
    <Filter.Item value="channelId">
      <IconTopologyStar3 />
      Select Channel
    </Filter.Item>
  );
};

export const SelectChannelFilterView = () => {
  const [channelId, setChannelId] = useQueryState<string>('channelId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="channelId">
      <SelectChannelProvider
        value={channelId || ''}
        onValueChange={(value) => {
          setChannelId(value as string);
          resetFilterState();
        }}
      >
        <SelectChannelsContent />
      </SelectChannelProvider>
    </Filter.View>
  );
};

export const SelectChannelFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [channelId, setChannelId] = useQueryState<string | string[]>(
    queryKey || 'channelId',
  );
  const [open, setOpen] = useState(false);

  if (!channelId) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'channelId'}>
      <Filter.BarName>
        <IconTopologyStar3 />
        {!iconOnly && 'Select Channel'}
      </Filter.BarName>
      <SelectChannelProvider
        value={channelId || (mode === 'single' ? '' : [])}
        mode={mode}
        onValueChange={(value) => {
          if (value.length > 0) {
            setChannelId(value as string[] | string);
          } else {
            setChannelId(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'channelId'}>
              <SelectChannelsValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectChannelsContent />
          </Combobox.Content>
        </Popover>
      </SelectChannelProvider>
    </Filter.BarItem>
  );
};

export const SelectChannel = {
  Provider: SelectChannelProvider,
  Value: SelectChannelsValue,
  Content: SelectChannelsContent,
  FormItem: SelectChannelsFormItem,
};
