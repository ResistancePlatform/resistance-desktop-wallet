import React from 'react'
import cn from 'classnames'

import resDexLogo from '~/assets/images/resdex/logo.svg'
import styles from './Logo.scss'

const Logo = () => (
  <div className={cn(styles.container)}>
    <img src={resDexLogo} alt="ResDEX" />
    ResDEX
  </div>
)

export default Logo
