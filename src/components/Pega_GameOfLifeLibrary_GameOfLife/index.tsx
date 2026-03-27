
/* eslint-disable no-nested-ternary */
import { Fragment } from 'react';
import { DateTimeDisplay, Card, CardHeader, CardContent, Flex, withConfiguration } from '@pega/cosmos-react-core';

import type { PConnFieldProps } from '../shared/PConnProps';

// includes in bundle
import Operator from './Operator';

import StyledPegaGameOfLifeLibraryGameOfLifeWrapper from './styles';


// interface for props
interface PegaGameOfLifeLibraryGameOfLifeProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  title: string;
  createLabel: string;
  updateLabel: string;
  resolveLabel: string;
  createOperator: any;
  updateOperator: any;
  resolveOperator: any;
  createDateTime: string;
  updateDateTime: string;
  resolveDateTime: string;
  hideLabel: boolean;
}


// Duplicated runtime code from Constellation Design System Component

// props passed in combination of props from property panel (config.json) and run time props from Constellation
// any default values in config.pros should be set in defaultProps at bottom of this file
function PegaGameOfLifeLibraryGameOfLife(props: PegaGameOfLifeLibraryGameOfLifeProps) {

  const {
    getPConnect,
    title = 'Create operator',
    label = 'Create operator',
    createLabel,
    updateLabel,
    createOperator,
    updateOperator,
    createDateTime,
    updateDateTime,
    resolveLabel,
    resolveOperator,
    resolveDateTime,
    hideLabel
  } = props;


  const [_label, user, dateTimeValue] =
    label === 'Create operator'
      ? [createLabel, createOperator, createDateTime]
      : label === 'Update operator'
      ? [updateLabel, updateOperator, updateDateTime]
      : [resolveLabel, resolveOperator, resolveDateTime];



  return user.userId && user.userName ? (
    <StyledPegaGameOfLifeLibraryGameOfLifeWrapper>
      <Card>
      <CardHeader>{title}</CardHeader>
      <CardContent>
      <Flex container={{ direction: 'row'}}>
            <Operator
              label={hideLabel ? '' : _label}
              name={user.userName}
              id={user.userId}
              getPConnect={getPConnect}
              value={undefined}
              validatemessage=''
              hideLabel={false}
              readOnly={false}
              required={false}
              disabled={false}
              externalUser={undefined}
              metaObj={undefined}
              testId=''
              helperText=''
            />
      {dateTimeValue && (
        <Fragment>
          {' '}
          <DateTimeDisplay value={dateTimeValue} variant='relative' />
        </Fragment>
      )}
      </Flex>
      </CardContent>
      </Card>

    </StyledPegaGameOfLifeLibraryGameOfLifeWrapper>
  ) : (
    <StyledPegaGameOfLifeLibraryGameOfLifeWrapper>
    defVal
    </StyledPegaGameOfLifeLibraryGameOfLifeWrapper>
  );



}



export default withConfiguration(PegaGameOfLifeLibraryGameOfLife);

// as objects are there in props, shallow comparision fails & re-rendering of comp happens even with
// same key value pairs in obj. hence using custom comparison function on when to re-render
// const comparisonFn = (prevProps, nextProps) => {
//   return prevProps.updateDateTime === nextProps.updateDateTime;
// };
