import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

const values = [
  'TimeSpanInSec',
  'EnergyReal_WAC_Sum_Produced',
  'EnergyReal_WAC_Sum_Consumed',
  'InverterEvents',
  'InverterErrors',
  'Current_DC_String_1',
  'Current_DC_String_2',
  'Voltage_DC_String_1',
  'Voltage_DC_String_2',
  'Temperature_Powerstage',
  'Voltage_AC_Phase_1',
  'Voltage_AC_Phase_2',
  'Voltage_AC_Phase_3',
  'Current_AC_Phase_1',
  'Current_AC_Phase_2',
  'Current_AC_Phase_3',
  'PowerReal_PAC_Sum',
];

const selectableValues: SelectableValue[] = [
  {
    label: 'Energy Real WAC Produced',
    value: 'EnergyReal_WAC_Sum_Produced',
  },
];

values.forEach(value => {
  selectableValues.push({
    label: value,
    value: value,
  });
});

const { FormField, Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, constant: parseFloat(event.target.value) });
    // executes the query
    onRunQuery();
  };

  onChannelChange = (event: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, type: event.value! });

    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, constant } = query;

    return (
      <div className="gf-form">
        <FormField
          width={4}
          value={constant}
          onChange={this.onConstantChange}
          label="Constant"
          type="number"
          step="0.1"
        />
        <FormField
          labelWidth={8}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query Text"
          tooltip="Not used yet"
        />
        <FormField labelWidth={8} value="test" label="test" tooltip="test" inputEl={<Select />} />
        <Select options={selectableValues} tooltipContent="sadržaj" onChange={this.onChannelChange} />
      </div>
    );
  }
}
