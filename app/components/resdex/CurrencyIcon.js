import React from 'react'
import PropTypes from 'prop-types'

import genericIcon from '~/assets/images/resdex/cryptocurrency-icons/generic.svg'

const icons = require.context('~/assets/images/resdex/cryptocurrency-icons', false, /.svg/)
const customIcons = require.context('~/assets/images/resdex/custom-cryptocurrency-icons', false, /.svg/)

const CurrencyIcon = ({symbol, size, ...props}) => {

  const findIcon = context => {
    if (!symbol) {
      return genericIcon
    }
    const lowerCasedSymbol = symbol.toLowerCase()
    const iconKey = context.keys().find(key => key.toLowerCase().includes(lowerCasedSymbol))
    return iconKey ? context(iconKey) : null
  }

	return (
    <img
			{...props}
      src={findIcon(customIcons) || findIcon(icons) || genericIcon}
      alt={symbol}
      style={{
        width: size,
        height: size
      }}
    />
	)
}

CurrencyIcon.propTypes = {
	symbol: PropTypes.string,
	size: PropTypes.string,
}

export default CurrencyIcon
