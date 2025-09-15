import { Input } from 'erxes-ui';
import { Attributes } from 'ui-modules/modules/automations/components/Attributes';
import { IField } from 'ui-modules/modules/segments';

type Props = {
  propertyType: string;
  value: string;
  onChange: (value: string) => void;
  selectedOperator: any;
  selectedField: any;
  onlySet?: boolean;
};

export const PlaceHolderInput = ({
  propertyType,
  value,
  onChange,
  selectedOperator,
  selectedField,
  onlySet,
}: Props) => {
  return (
    <div className="flex flex-row items-end gap-2">
      <Input
        value={value}
        placeholder="Value"
        onChange={(e) => onChange(e.target.value)}
        disabled={!operatorValue}
      />
      <Attributes
        selectedField={selectedField}
        selectedOperator={selectedOperator}
        contentType={propertyType}
        value={value}
        onSelect={onChange}
        isForSelectField={fieldType === 'select'}
      />
    </div>
  );
};
