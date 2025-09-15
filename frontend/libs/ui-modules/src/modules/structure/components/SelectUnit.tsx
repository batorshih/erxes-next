import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
  Popover,
  TextOverflowTooltip,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useSelectUnitContext } from '../hooks/useSelectUnitContext';
import { IUnit } from '../types/Unit';
import { SelectUnitContext } from '../contexts/SelectUnitContext';
import { useUnitById } from '../hooks/useUnitById';
import { useUnits } from '../hooks/useUnits';

export const SelectUnit = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    value?: string;
    onValueChange: (value: string) => void;
  }
>(({ value, onValueChange, ...props }, ref) => {
  const [_open, _setOpen] = useState(false);
  return (
    <SelectUnitProvider>
      <Popover open={_open} onOpenChange={_setOpen}>
        <Combobox.Trigger
          {...props}
          ref={ref}
          className={cn('w-full flex text-left', props.className)}
        >
          <SelectUnitValue value={value} />
        </Combobox.Trigger>
        <Combobox.Content>
          <UnitList
            renderItem={(unit) => (
              <SelectUnitItem
                key={unit._id}
                unit={unit}
                onValueChange={(value) => {
                  onValueChange(value);
                  _setOpen(false);
                }}
                selected={unit._id === value}
              />
            )}
          />
        </Combobox.Content>
      </Popover>
    </SelectUnitProvider>
  );
});

export const SelectUnitItem = ({
  unit,
  onValueChange,
  selected,
}: {
  unit: IUnit;
  onValueChange: (value: string) => void;
  selected?: boolean | undefined;
}) => {
  const { setSelectedUnit, selectedUnit } = useSelectUnitContext();
  return (
    <Command.Item
      value={unit.title}
      onSelect={() => {
        setSelectedUnit(unit);
        onValueChange(unit._id);
      }}
    >
      <SelectUnitBadge unit={unit} selected={selected} />
    </Command.Item>
  );
};
export const SelectUnitProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedUnit, setSelectedUnit] = useState<IUnit | undefined>(
    undefined,
  );
  return (
    <SelectUnitContext.Provider value={{ selectedUnit, setSelectedUnit }}>
      {children}
    </SelectUnitContext.Provider>
  );
};

const SelectUnitValue = ({ value }: { value?: string }) => {
  const { selectedUnit } = useSelectUnitContext();

  const { unitDetail, loading } = useUnitById({
    variables: { _id: value },
    skip: !value,
  });
  if (loading) return <Skeleton className="h-4 w-32 overflow-hidden" />;
  return (
    <Combobox.Value
      placeholder="Select Unit"
      value={unitDetail?.title || selectedUnit?.title}
    />
  );
};

export const UnitList = ({
  renderItem,
}: {
  renderItem: (unit: IUnit) => React.ReactNode;
}) => {
  const { units, loading } = useUnits();
  return (
    <Command>
      <Command.Input placeholder="Search unit" />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {units?.map((unit) => renderItem(unit))}
      </Command.List>
    </Command>
  );
};

const SelectUnitBadge = ({
  unit,
  selected,
}: {
  unit?: IUnit;
  selected?: boolean;
}) => {
  if (!unit) return null;

  const { title, code, userCount } = unit;

  return (
    <>
      <div className="flex items-center gap-2 flex-auto overflow-hidden justify-start">
        <div className="text-muted-foreground">{code}</div>
        <TextOverflowTooltip value={title} className="flex-auto" />
      </div>
      {!selected ? (
        userCount > 0 && (
          <div className="text-muted-foreground ml-auto">{userCount}</div>
        )
      ) : (
        <Combobox.Check checked={selected} />
      )}
    </>
  );
};

export const SelectUnitItem = ({ unit }: { unit: IUnit }) => {
  const { onSelect, selectedUnit } = useSelectUnitContext();
  const isSelected = selectedUnit?._id === unit._id;
  return (
    <Command.Item
      key={unit._id}
      value={unit._id}
      onSelect={() => {
        onSelect(unit);
      }}
    >
      <TextOverflowTooltip
        value={unit.title}
        className="flex-auto w-auto font-medium"
      />
      <Combobox.Check checked={isSelected} />
    </Command.Item>
  );
};

export const SelectUnitValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedUnit, value, setSelectedUnit, onSelect } =
    useSelectUnitContext();

  if (!value || value === undefined) {
    return <Combobox.Value placeholder={placeholder || ''} />;
  }

  return (
    <UnitBadge
      unit={selectedUnit}
      variant={'secondary'}
      unitId={value}
      renderAsPlainText
      onCompleted={(unit) => {
        if (!unit) return;
        setSelectedUnit(unit);
      }}
      onClose={() => onSelect?.(selectedUnit as IUnit)}
    />
  );
};

export const SelectUnitContent = ({
  disableCreateOption,
}: {
  disableCreateOption?: boolean;
}) => {
  const { newUnitName } = useSelectUnitContext();

  if (newUnitName) {
    return (
      <SelectUnitCreateContainer>
        <CreateUnitForm />
      </SelectUnitCreateContainer>
    );
  }
  return <SelectUnitCommand disableCreateOption={disableCreateOption} />;
};

export const SelectUnitInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectUnitValue placeholder="Select unit" />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="min-w-72">
          <SelectUnitContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectUnitProvider>
  );
};

export const SelectUnitDetail = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'> &
    Omit<
      React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
      'children'
    > & {
      scope?: string;
    }
>(({ onValueChange, scope, value, options, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...{ value, options }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger ref={ref} {...props}>
          <SelectUnitValue placeholder="Select unit" />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectUnitContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectUnitProvider>
  );
});

SelectUnitDetail.displayName = 'SelectUnitDetail';

export const SelectUnitCommandbarItem = ({
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'>) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Button variant={'secondary'} asChild>
          <RecordTableInlineCell.Trigger>
            <IconUsers />
            Unit
          </RecordTableInlineCell.Trigger>
        </Button>
        <RecordTableInlineCell.Content className="w-96">
          <SelectUnitContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectUnitProvider>
  );
};

export const SelectUnitFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectUnitProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectUnitProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectUnitValue placeholder="Select unit" />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectUnitContent />
        </Combobox.Content>
      </Popover>
    </SelectUnitProvider>
  );
};

export const SelectUnitFilterItem = () => {
  return (
    <Filter.Item value={'unitId'}>
      <IconUsers />
      Unit
    </Filter.Item>
  );
};

export const SelectUnitFilterView = () => {
  const [query, setQuery] = useQueryState<string>('unitId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={'unitId'}>
      <SelectUnitProvider
        value={query as string}
        onValueChange={(value) => {
          setQuery(value as string);
          resetFilterState();
        }}
      >
        <SelectUnitContent disableCreateOption />
      </SelectUnitProvider>
    </Filter.View>
  );
};

export const SelectUnitFilterBar = () => {
  const [query, setQuery] = useQueryState<string>('unitId');
  const [open, setOpen] = useState<boolean>(false);

  if (!query) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="unitId">
      <Filter.BarName>
        <IconUsers />
        Unit
      </Filter.BarName>
      <SelectUnitProvider
        value={query as string}
        onValueChange={(value) => {
          if (value) {
            setQuery(value as string);
          } else {
            setQuery(null);
          }
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={'unitId'}>
              <SelectUnitValue placeholder="Select unit" />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectUnitContent disableCreateOption />
          </Combobox.Content>
        </Popover>
      </SelectUnitProvider>
    </Filter.BarItem>
  );
};

export const SelectUnit = Object.assign(SelectUnitProvider, {
  Provider: SelectUnitProvider,
  CommandBarItem: SelectUnitCommandbarItem,
  Content: SelectUnitContent,
  Command: SelectUnitCommand,
  Item: SelectUnitItem,
  Value: SelectUnitValue,
  InlineCell: SelectUnitInlineCell,
  FormItem: SelectUnitFormItem,
  FilterItem: SelectUnitFilterItem,
  FilterView: SelectUnitFilterView,
  FilterBar: SelectUnitFilterBar,
  Detail: SelectUnitDetail,
});
