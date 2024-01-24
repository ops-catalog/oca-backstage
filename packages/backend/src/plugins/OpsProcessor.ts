import {
    Entity,
  } from '@backstage/catalog-model';
  import {
    CatalogProcessor,
    CatalogProcessorEmit,
  } from '@backstage/plugin-catalog-node';
  import { LocationSpec } from '@backstage/plugin-catalog-common';

  /**
   * Adds support for scaffolder specific entity kinds to the catalog.
   *
   * @public
   */
  export class OpsProcessor implements CatalogProcessor {
    getProcessorName(): string {
      return 'OpsProcessor';
    }
  
    private readonly validators = [];
  
    async validateEntityKind(entity: Entity): Promise<boolean> {
      return entity.apiVersion === "v1";
    }
  
    async postProcessEntity(
      entity: Entity,
      _location: LocationSpec,
      emit: CatalogProcessorEmit,
    ): Promise<Entity> {
  
      return entity;
    }
  }
