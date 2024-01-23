import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { PluginEnvironment } from '../types';

export class OpsProvider implements EntityProvider {
  private connection?: EntityProviderConnection;
  private env: PluginEnvironment;

  public constructor(env: PluginEnvironment) {
    this.env = env;
  }
  getProviderName(): string {
    return `ops-catalog`;
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('DB not initilized');
    }
    const catalogObj: any[] = [];
    const staff = await fetch('http://localhost:8080/api/catalog');
    const d = await staff.json();
    // TODO: refine mapping
    for (const entity of d.data) {
      console.log("===============", entity.kind,",",entity.metadata.name, "============");
      const links = undefined;
      let kind = entity.kind;
      switch(kind) {
        case 'Endpoint':
          kind = 'Resource';
          break;
        case 'Resource':
          kind = 'Resource';
          break;
        default:
          kind = 'Component';
      }
      let name = `${entity.metadata.name.replaceAll(" ", "")}`;
      let owner = '@backstage/maintainers';
      if (entity.contact.owner) {
        owner = `${entity.contact.owner.id}`; 
      }
      let annotations = entity.metadata.annotations || {};
      annotations[ANNOTATION_LOCATION] ='ops:https://ops-catalog.io/';
      annotations[ANNOTATION_ORIGIN_LOCATION]='ops:https://ops-catalog.io/';

      let tags = entity.classification.tag || [];
      let sourceLabels = entity.metadata.labels || {};
      let labels = new Map(Object.entries(sourceLabels).map(([k,v]) => [k,String(v).replaceAll(" ", "").replaceAll("@", "_at_")]))
      let system = entity.classification.capability || "unknown";
      const catalogEntity = {
        kind: kind,
        apiVersion: 'backstage.io/v1alpha1',
        metadata: {
          description: `${entity.metadata.description}`,
          annotations: annotations,
          labels: labels,
          links,
          // name of the entity
          name: `${name}`,
          title: `${entity.class}`,
          tags: tags,
        },
        spec: {
          type: `${entity.class}`,
          lifecycle: 'production',
          owner: owner,
          profile: {
            displayName: `${entity.metadata.name}`,
            email: '',
            picture: '',
          },
          memberOf: [],
          system: `${system}`
        },
      };

      catalogObj.push(catalogEntity);
    }

    await this.connection?.applyMutation({
      type: 'full',
      entities: catalogObj.map(entity => {
        return { entity, locationKey: 'ops:https://ops-catalog.io/' };
      }),
    });
  }
}
