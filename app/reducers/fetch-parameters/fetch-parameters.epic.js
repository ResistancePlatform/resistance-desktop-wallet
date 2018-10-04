// @flow
import { of, from, concat, merge } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { translate } from '~/i18next.config'


const t = translate('other')

export const FetchParametersEpic = (action$, state$) => merge(
)
