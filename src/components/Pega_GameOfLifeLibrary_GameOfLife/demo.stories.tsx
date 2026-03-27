/* eslint-disable react/jsx-no-useless-fragment */
import type { Meta, StoryObj } from '@storybook/react';

import PegaGameOfLifeLibraryGameOfLife from './index';

import { configProps } from './mock';

const meta: Meta<typeof PegaGameOfLifeLibraryGameOfLife> = {
  title: 'PegaGameOfLifeLibraryGameOfLife',
  component: PegaGameOfLifeLibraryGameOfLife,
  excludeStories: /.*Data$/
};

export default meta;
type Story = StoryObj<typeof PegaGameOfLifeLibraryGameOfLife>;

if (!window.PCore) {
  window.PCore = {} as any;
}

window.PCore.getLocaleUtils = () => {
  return {
    getLocaleValue: (value: any) => {
      return value;
    }
  } as any;
};

window.PCore.getUserApi = () => {
  return {
    getOperatorDetails: () => {
      return new Promise(resolve => {
        // @ts-ignore
        resolve(operatorDetails);
      });
    }
  } as any;
};

export const BasePegaGameOfLifeLibraryGameOfLife: Story = (args: any) => {
  const props = {
    // Read from args so Storybook controls take effect
    label: args.label !== undefined ? args.label : configProps.label,
    rows: args.rows !== undefined ? args.rows : configProps.rows,
    cols: args.cols !== undefined ? args.cols : configProps.cols,

    getPConnect: () => {
      return {
        getActionsApi: () => {
          return {
            updateFieldValue: () => {
              /* nothing */
            },
            triggerFieldChange: () => {
              /* nothing */
            }
          };
        },
        ignoreSuggestion: () => {
          /* nothing */
        },
        acceptSuggestion: () => {
          /* nothing */
        },
        setInheritedProps: () => {
          /* nothing */
        },
        resolveConfigProps: () => {
          /* nothing */
        }
      };
    }
  };

  return (
    <>
      <PegaGameOfLifeLibraryGameOfLife {...props} {...args} />
    </>
  );
};
