import React from 'react'
import cn from 'classnames'

import styles from './Logo.scss'

const Logo = () => (
  <div className={cn(styles.container)}>
    <img src="assets/images/resdex/logo.svg" alt="ResDEX" />
    ResDEX
  </div>
)

export default Logo
