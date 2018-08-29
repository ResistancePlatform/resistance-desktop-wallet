// @flow
import { connect } from 'react-redux'

import { AddressBookActions } from '../state/reducers/address-book/address-book.reducer'
import { AddressBook } from '../components/address-book/AddressBook'

const mapStateToProps = (state) => ({
	addressBook: state.addressBook
})

const mapDispatchToProps = () => AddressBookActions

export default connect(mapStateToProps, mapDispatchToProps)(AddressBook)
