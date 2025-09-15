import { Filter, PageSubHeader, useMultiQueryState } from 'erxes-ui';
import {
  SelectBranches,
  SelectBrands,
  SelectDepartments,
  SelectUnit,
} from 'ui-modules';
import { TeamMemberFilterPopover } from './TeamMemberFilterPopover';
import { TeamMemberCounts } from '../TeamMemberCounts';

export const TeamMemberFilterBar = () => {
  const [queries] = useMultiQueryState<{
    branchIds: string[];
    departmentIds: string[];
    unitId: string;
    isActive: boolean;
    brandIds: string[];
  }>(['branchIds', 'departmentIds', 'unitId', 'isActive', 'brandIds']);

  const isFiltered = Object.values(queries).some((query) => !!query);

  const { branchIds, departmentIds, unitId, brandIds } = queries;

  return (
    <Filter id="team-member">
      <PageSubHeader>
        <Filter.Bar>
          <TeamMemberFilterPopover />
          <Filter.Dialog>
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" />
            </Filter.View>
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          {!!brandIds && (
            <SelectBrands.FilterBar
              mode="multiple"
              filterKey="brandIds"
              label="Brands"
            />
          )}
          <TeamMemberCounts />
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
};

const BranchFilterBar = () => {
  const [branchId, setBranchId] = useQueryState<string>('branchId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.BarItem>
      <Filter.BarName>
        <IconGitBranch />
        Branch
      </Filter.BarName>
      <SelectBranchTree
        selected={branchId ?? undefined}
        onSelect={(value) => {
          setBranchId(value);
          resetFilterState();
        }}
        recordId="branchId"
        className="h-7 shadow-none rounded-none"
      />
      <Filter.BarClose filterKey="branchId" />
    </Filter.BarItem>
  );
};

const DepartmentFilterBar = () => {
  const [departmentId, setDepartmentId] = useQueryState<string>('departmentId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.BarItem>
      <Filter.BarName>
        <IconFolder />
        Department
      </Filter.BarName>
      <SelectDepartmentTree
        selected={departmentId ?? undefined}
        onSelect={(value) => {
          setDepartmentId(value);
          resetFilterState();
        }}
        recordId="departmentId"
        className="h-7 shadow-none rounded-none"
      />
      <Filter.BarClose filterKey="departmentId" />
    </Filter.BarItem>
  );
};

const UnitFilterBar = () => {
  const [unitId, setUnitId] = useQueryState<string>('unitId');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.BarItem>
      <Filter.BarName>
        <IconUsersGroup />
        Unit
      </Filter.BarName>
      <SelectUnit
        value={unitId ?? undefined}
        onValueChange={(value) => {
          setUnitId(value);
          resetFilterState();
        }}
        className="h-7 rounded-none shadow-none"
      />
      <Filter.BarClose filterKey="unitId" />
    </Filter.BarItem>
  );
};
