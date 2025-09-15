import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  RecordTableInlineCell,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useBrands } from '../hooks/useBrands';
import { IBrand } from '../types/brand';
import { useDebounce } from 'use-debounce';
import React from 'react';
import { cn } from 'erxes-ui';

interface SelectBrandProps extends Omit<ButtonProps, 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

interface SelectBrandTriggerProps extends ButtonProps {
  currentValue: string;
  currentName: string;
}

export const SelectBrand = React.forwardRef<
  HTMLButtonElement,
  SelectBrandProps
>(({ value, onValueChange, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const {
    brands = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useBrands({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  const currentValue = brands?.find((brand) => brand._id === value)?._id;

  const handleSelectBrand = (brandId: string) => {
    onValueChange(brandId === currentValue ? '' : brandId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <SelectBrandTrigger
        currentValue={currentValue || ''}
        currentName={
          brands.find((brand) => brand._id === currentValue)?.name || ''
        }
        ref={ref}
        {...props}
      />
      <Combobox.Content>
        <Command shouldFilter={false} id="brand-command-menu">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            variant="secondary"
            wrapperClassName="flex-auto"
            placeholder="Search brand..."
            className="h-9"
          />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {brands?.map((brand) => (
              <SelectBrandItem
                key={brand._id}
                brand={brand}
                currentValue={currentValue || ''}
                handleSelectBrand={handleSelectBrand}
              />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {brands
          .filter((brand) => !selectedBrands.some((b) => b._id === brand._id))
          .map((brand) => (
            <SelectBrandCommandItem key={brand._id} brand={brand} />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount}
          currentLength={brands.length}
        />
      </Command.List>
    </Command>
  );
};

export const SelectBrandFilterItem = () => {
  return (
    <Filter.Item value="brand">
      <IconLabel />
      Brand
    </Filter.Item>
  );
};

export const SelectBrandFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [brand, setBrand] = useQueryState<string[] | string>(
    queryKey || 'brand',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'brand'}>
      <SelectBrandProvider
        mode={mode}
        value={brand || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setBrand(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectBrandContent />
      </SelectBrandProvider>
    </Filter.View>
  );
};

export const SelectBrandFilterBar = ({
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
  const [brand, setBrand] = useQueryState<string[] | string>(
    queryKey || 'brand',
  );
  const [open, setOpen] = useState(false);

  return (
    <Filter.BarItem queryKey={queryKey || 'brand'}>
      <Filter.BarName>
        <IconLabel />
        {!iconOnly && 'Brand'}
      </Filter.BarName>
      <SelectBrandProvider
        mode={mode}
        value={brand || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setBrand(value as string[] | string);
          } else {
            setBrand(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'brand'}>
              <SelectBrandValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectBrandContent />
          </Combobox.Content>
        </Popover>
      </SelectBrandProvider>
    </Filter.BarItem>
  );
};

export const SelectBrandInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger>
          <SelectBrandValue placeholder={''} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectBrandContent />
        </RecordTableInlineCell.Content>
      </Popover>
    </SelectBrandProvider>
  );
};

export const SelectBrandFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectBrandProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectBrandValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectBrandContent />
        </Combobox.Content>
      </Popover>
    </SelectBrandProvider>
  );
};

SelectBrandFormItem.displayName = 'SelectBrandFormItem';

const SelectBrandRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectBrandProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectBrandProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      mode={mode}
      value={value}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          ref={ref}
          className={cn('w-full inline-flex', className)}
          variant="outline"
          {...props}
        >
          <SelectBrandValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectBrandContent />
        </Combobox.Content>
      </Popover>
    </SelectBrandProvider>
  );
});

SelectBrand.displayName = 'SelectBrand';

// const SelectBrandCommand = () => {
//   const [search, setSearch] = React.useState('');
//   const [debouncedSearch] = useDebounce(search, 500);
//   const {
//     brands = [],
//     loading,
//     handleFetchMore,
//     totalCount = 0,
//   } = useBrands({
//     variables: {
//       searchValue: debouncedSearch,
//     },
//   });

//   return (
//     <Command shouldFilter={false} id="brand-command-menu">
//       <Command.Input
//         value={search}
//         onValueChange={setSearch}
//         variant="secondary"
//         wrapperClassName="flex-auto"
//         placeholder="Search brand..."
//         className="h-9"
//       />
//       <Command.List>
//         <Combobox.Empty loading={loading} />
//         {brands?.map((brand) => (
//           <SelectBrandItem
//             key={brand._id}
//             brand={brand}
//             currentValue={currentValue || ''}
//             handleSelectBrand={handleSelectBrand}
//           />
//         ))}
//         <Combobox.FetchMore
//           fetchMore={handleFetchMore}
//           totalCount={totalCount}
//           currentLength={brands.length}
//         />
//       </Command.List>
//     </Command>
//   );
// };

const SelectBrandTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectBrandTriggerProps
>(({ currentName, className, ...props }, ref) => {
  return (
    <Combobox.Trigger
      className={cn('w-full flex', className)}
      ref={ref}
      {...props}
    >
      <Combobox.Value
        value={currentName}
        placeholder="Select brand"
        className="truncate"
      />
    </Combobox.Trigger>
  );
});

SelectBrandTrigger.displayName = 'SelectBrandTrigger';

interface SelectBrandItemProps {
  brand: IBrand;
  handleSelectBrand: (brandId: string) => void;
  currentValue: string;
}

const SelectBrandItem: React.FC<SelectBrandItemProps> = ({
  brand,
  handleSelectBrand,
  currentValue,
}) => {
  return (
    <Command.Item
      key={brand._id}
      className="h-7"
      value={brand._id}
      onSelect={() => handleSelectBrand(brand._id)}
      title={brand.name}
    >
      <span className="text-xs text-foreground truncate">{brand.name}</span>
      <Combobox.Check checked={currentValue === brand._id} />
    </Command.Item>
  );
};
