/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { PluginEnvironment } from '../types';
import { OpsProvider } from './OpsProvider';
import { OpsProcessor } from './OpsProcessor';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<any> {
  const builder = CatalogBuilder.create(env);
  const frobs = new OpsProvider(env);
  builder.addEntityProvider(frobs);
  builder.addProcessor(new OpsProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  await env.scheduler.scheduleTask({
    id: 'run_ops_refresh',
    fn: async () => {
      await frobs.run()
    },
    frequency: { minutes: 2 },
    timeout: { minutes: 1 },
  });
  return router;
}
