import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

import { getBackendSrv } from '@grafana/runtime';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  path: string;
  url?: string;
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);

    this.path = instanceSettings.jsonData.path || '192.168.1.1';

    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range, targets } = options;

    const {type}: MyQuery = targets[0];
    const from = range!.from.format('DD.MM.YYYY');
    const to = range!.to.format('DD.MM.YYYY');

    // Return a constant for each query.
    const data = options.targets.map(async target => {
      const query = defaults(target, defaultQuery);

      const response = await getBackendSrv().fetch({
        url: `${this.url}/fronius/solar_api/v1/GetArchiveData.cgi?Scope=System&StartDate=${from}&EndDate=${to}&Channel=TimeSpanInSec&Channel=${type}`,
        method: 'GET',
        params: {},
      });
      const responseData = await response.toPromise();

      console.log(responseData);

      const responseDataJson: any = responseData.data;

      console.log(responseDataJson);

      let finalTimestamps: any[] = [];
      let finalEnergies: any[] = [];

      try {
        const timeSpanInSec = responseDataJson.Body.Data['inverter/1'].Data.TimeSpanInSec.Values;
        const energy = responseDataJson.Body.Data['inverter/1'].Data['EnergyReal_WAC_Sum_Produced'].Values;

        const startDate = responseDataJson.Body.Data['inverter/1'].Start;

        const startDateTimestamp = new Date(startDate).valueOf();

        const timeSpanInSecArray: any[] = [];

        const energyRealWacSumProducedArray: any[] = [];

        const timestamps: any[] = [];

        let currentTimestamp = startDateTimestamp;

        Object.keys(timeSpanInSec).forEach(key => {
          timeSpanInSecArray.push(timeSpanInSec[key]);
        });

        Object.keys(energy).forEach(key => {
          energyRealWacSumProducedArray.push(energy[key]);

          timestamps.push(currentTimestamp + +key * 1000);
        });

        // timeSpanInSecArray.reverse();

        // timeSpanInSecArray.forEach(time => {
        //   timestamps.push(currentTimestamp - time * 1000);
        //   currentTimestamp = currentTimestamp - time * 1000;
        // });

        // timestamps.reverse();

        finalTimestamps = [...timestamps];

        finalEnergies = [...energyRealWacSumProducedArray];
      } catch (err) {
        console.log(err);
      }
      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [...finalTimestamps], type: FieldType.time },
          { name: 'Value', values: [...finalEnergies], type: FieldType.number },
        ],
      });
    });

    return Promise.all(data).then(data => ({ data }));
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
