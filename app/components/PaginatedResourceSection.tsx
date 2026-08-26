import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <>
            <PreviousLink className="block mb-4 text-center">
              {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
            </PreviousLink>
            <div className={resourcesClassName}>{resourcesMarkup}</div>
            <NextLink className="block mt-4 text-center">
              {isLoading ? 'Loading...' : <span>Load more ↓</span>}
            </NextLink>
          </>
        );
      }}
    </Pagination>
  );
}
