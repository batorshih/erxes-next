import {
  SelectProductContext,
  useSelectProductContext,
} from '../contexts/SelectProductContext';
import { IProduct } from '../types/Product';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from 'use-debounce';
import React, { useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
  RecordTableInlineCell,
} from 'erxes-ui';
import { ProductsInline } from './ProductsInline';
import { IconShoppingCart } from '@tabler/icons-react';

export const SelectProduct = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  React.ComponentPropsWithoutRef<typeof Combobox.Trigger> & {
    value?: string;
    onValueChange?: (value: string) => void;
    scope?: string;
  }
>(({ value, onValueChange, scope, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | undefined>(
    undefined,
  );

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const handleSelect = (product?: IProduct) => {
    setSelectedProduct(product);
    onValueChange?.(product?._id || '');
    setOpen(false);
    scope && goBackToPreviousHotkeyScope();
  };

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen} modal>
      <Combobox.Trigger ref={ref} {...props}>
        {!value && <Combobox.Value placeholder="Select product" />}
        {value && <ProductInline productId={value} product={selectedProduct} />}
      </Combobox.Trigger>
      <Combobox.Content>
        <SelectProductList handleSelect={handleSelect} />
      </Combobox.Content>
    </PopoverScoped>
  );
});

export const SelectProductList = ({
  handleSelect,
}: {
  handleSelect: (product?: IProduct) => void;
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { loading, products, totalCount, handleFetchMore, error } = useProducts(
    {
      variables: {
        searchValue: debouncedSearch,
      },
    },
  );

  return (
    <Command shouldFilter={false}>
      <Command.Input value={search} onValueChange={setSearch} />
      <Command.List>
        <Combobox.Empty loading={loading} error={error} />
        {products?.map((product) => (
          <Command.Item
            key={product._id}
            value={product.name}
            onSelect={() => handleSelect(product)}
          >
            <ProductInline product={product} />
          </Command.Item>
        ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={products?.length || 0}
          totalCount={totalCount || 0}
        />
      </Command.List>
    </Command>
  );
};

const SelectProductCommandItem = ({ product }: { product: IProduct }) => {
  const { onSelect, productIds } = useSelectProductContext();
  return (
    <Command.Item
      value={product._id}
      onSelect={() => {
        onSelect(product);
      }}
    >
      <ProductsInline products={[product]} placeholder="Unnamed product" />
      <Combobox.Check checked={productIds.includes(product._id)} />
    </Command.Item>
  );
};

const SelectProductInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectProductProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectProductProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectProductValue />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectProductContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectProductProvider>
  );
};

const SelectProductRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectProductProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
      scope?: string;
    }
>(
  (
    { onValueChange, className, mode, value, placeholder, scope, ...props },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    return (
      <SelectProductProvider
        mode={mode}
        value={value}
        onValueChange={(value) => {
          if (mode === 'single') {
            setOpen(false);
          }
          onValueChange?.(value);
        }}
      >
        <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
          <Combobox.Trigger
            className={cn('w-full inline-flex', className)}
            variant="outline"
            ref={ref}
            {...props}
          >
            <SelectProductValue />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectProductContent />
          </Combobox.Content>
        </PopoverScoped>
      </SelectProductProvider>
    );
  },
);

const SelectProductValue = ({ placeholder }: { placeholder?: string }) => {
  const { productIds, products, setProducts } = useSelectProductContext();

  return (
    <ProductsInline
      productIds={productIds}
      products={products}
      updateProducts={setProducts}
      placeholder={placeholder}
    />
  );
};

export const SelectProductFilterItem = () => {
  return (
    <Filter.Item value="product">
      <IconShoppingCart />
      Product
    </Filter.Item>
  );
};

export const SelectProductFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [product, setProduct] = useQueryState<string[] | string>(
    queryKey || 'product',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'product'}>
      <SelectProductProvider
        mode={mode}
        value={product || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setProduct(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectProductContent />
      </SelectProductProvider>
    </Filter.View>
  );
};

export const SelectProductFilterBar = ({
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
  const [product, setProduct] = useQueryState<string[] | string>(
    queryKey || 'product',
  );
  const [open, setOpen] = useState(false);

  if (!product) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'product'}>
      <Filter.BarName>
        <IconShoppingCart />
        {!iconOnly && 'Products'}
      </Filter.BarName>
      <SelectProductProvider
        mode={mode}
        value={product || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value.length > 0) {
            setProduct(value as string[] | string);
          } else {
            setProduct(null);
          }
          setOpen(false);
          onValueChange?.(value);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'product'}>
              <SelectProductValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectProductContent />
          </Combobox.Content>
        </Popover>
      </SelectProductProvider>
    </Filter.BarItem>
  );
};

export const SelectProductFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectProductProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectProductProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectProductValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectProductContent />
        </Combobox.Content>
      </Popover>
    </SelectProductProvider>
  );
};

export const SelectProduct = Object.assign(SelectProductRoot, {
  Provider: SelectProductProvider,
  Content: SelectProductContent,
  Item: SelectProductCommandItem,
  InlineCell: SelectProductInlineCell,
  Value: SelectProductValue,
  FilterItem: SelectProductFilterItem,
  FilterView: SelectProductFilterView,
  FilterBar: SelectProductFilterBar,
  FormItem: SelectProductFormItem,
});
