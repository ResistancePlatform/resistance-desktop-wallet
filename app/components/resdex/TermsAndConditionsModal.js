// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { translate } from 'react-i18next'
import cn from 'classnames'
import { toastr } from 'react-redux-toastr'

import { RoundedButton } from '~/components/rounded-form'
import { ResDexLoginActions } from '~/reducers/resdex/login/reducer'

import styles from './TermsAndConditionsModal.scss'
import scrollStyles from '~/assets/styles/scrollbar.scss'

type Props = {
  t: any,
  actions: object
}

/**
 * @class TermsAndConditionsModal
 * @extends {Component<Props>}
 */
class TermsAndConditionsModal extends Component<Props> {
	props: Props

  constructor(props) {
    super(props)
    this.state = {
      isScrolledToBottom: false
    }
  }

  handleScroll(e) {
    const { target } = e
    this.setState({
      isScrolledToBottom: target.scrollHeight - target.scrollTop === target.clientHeight
    })
  }

	render() {
    const { t } = this.props

    return (
      <div className={styles.overlay}>
        <div className={cn(styles.container, styles.termsAndConditions)}>
          <div
            role="button"
            tabIndex={0}
            className={cn('icon', styles.closeButton)}
            onClick={this.props.actions.closeTermsAndConditionsModal}
            onKeyDown={() => {}}
          />

          {/* Title */}
          <div className={styles.title}>
            {t(`Resistance Terms & Conditions`)}
          </div>

          <div className={styles.hint}>
            {t(`Please read, and agree to, the following before proceeding.`)}
          </div>

          <div
            className={cn(styles.content, scrollStyles.scrollbar, scrollStyles.important)}
            onScroll={target => this.handleScroll(target)}
          >
            <h2>DISCLAIMER</h2>
            <p>Access to the website, desktop application, and participation in the token sale is strictly restricted to persons who are not U.S. citizens and who are located outside of the U.S., pursuant to Regulation S under the U.S. Securities Act of 1933, as amended (the &ldquo;Securities Act&rdquo;). Nothing in this website, desktop application, or token sale shall be deemed to constitute an offer, offer to sell, or the solicitation of an offer to buy, any securities in any U.S. jurisdiction. Each person accessing this website will be deemed to have understood and agreed that: (1) he is not a U.S. citizen and he is located outside of the U.S; (2) any securities described herein have not been and will not be registered under the Securities Act or with any securities regulatory authority of any state, and may not be transferred to any U.S. citizen unless the securities are registered under the Securities Act, or an exemption from the registration requirements of the Securities Act is available. If you accept the foregoing terms and the Terms of Use for this website, please proceed. Otherwise, please leave immediately. As defined Regulation S under the Securities Act, the term &ldquo;U.S person&rdquo; means: (1) any natural person resident in the United States; (2) any partnership or corporation organized or incorporated under the laws of the United States; (3) any state of which any executor or administrator is a U.S. person; (4) any trust of which any trustee is a U.S. person; (5) any agency or branch of a foreign entity located in the United States; (6) any non-discretionary account or similar account (other than an estate or trust) held by a dealer or other fiduciary for the benefit or account of a U.S. person;(7) any discretionary account or similar account (other than an estate or trust) held by a dealer or other fiduciary organized, incorporated, or (if an individual) resident in the United States; and (8) any partnership or corporation if: (A)organized or incorporated under the laws of any foreign jurisdiction; and (B) formed by a U.S. person principally for the purpose of investing in securities not registered under the Securities Act, unless it is organized or incorporated, and owned, by accredited investors (as defined in Rule 501(a) of the Securities Act) who are not natural persons, estates or trusts.</p>
            <h2>PERSONAL SECURITY PROTOCOLS</h2>
            <p>Resistance is not responsible for the security of your devices. If one of your devices is breached, you could lose both currency and contracts.</p>
            <p>Resistance is not responsible for how you operate online. If you break any laws, betray the trust of another user, or behave unethically while using the platform, you will suffer the consequences.</p>
            <h2>LEGAL ISSUES – BRIEF</h2>
            <h3>Liabilities and Warranties</h3>
            <p>The user expressly knows and agrees that the user is using the Resistance platform at the user&lsquo;s sole risk.</p>
            <p>ResDEX is in BETA version. Resistance is by no means responsible for any lost assets including but not limited to assets lost during trades, transfers, withdrawals, or deposits. Use at your own risk.</p>
            <p>The user represents that the user had an adequate understanding of the risks, usages, and intricacies of cryptographic tokens and blockchain-based open-source software, Resistance, and the Resistance coin.</p>
            <p>The user acknowledges and agrees that, to the fullest extent permitted by any applicable law, the disclaimers of liability contained herein apply to any and all damages or injury whatsoever caused by or related to risks of, use of, or inability to use, the Resistance platform under any cause of action whatsoever of any kind in any jurisdiction, including, without limitation, actions for breach of warranty, breach of contract or tort (including negligence) and that neither Resistance nor the Resistance Team shall be liable for any indirect, incidental, special, exemplary or consequential damages, including for loss of profits, goodwill or data.</p>
            <p>Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for certain types of damages. Therefore, some of the above limitations in this section may not apply to a user. In particular, nothing in these terms shall affect the statutory rights of any user or exclude injury arising from any willful misconduct or fraud of Resistance.</p>
            <h2>LEGAL ISSUES – EXTENDED</h2>
            <p>The following Terms and Conditions (&ldquo;Terms&rdquo;) govern the use of the Resistance open-source software platform (&ldquo;Resistance Platform&rdquo;). Before any use of the Resistance Platform, the User confirms to understand and expressly agrees to all of the Terms. All capitalized terms in this agreement will be given the same effect and meaning as in the Terms. The group of developers and other personnel that is now, or will be, employed by, or contracted with, Resistance (&ldquo;Resistance&rdquo;) is termed the &ldquo;Resistance Team.&rdquo; The Platform will be developed by persons and entities who support Resistance.</p>
            The user acknowledges the following major risks to any use of the Resistance Platform and expressly agrees to neither hold Resistance nor the Resistance Team liable should any of the following risks transpire:
            <h4>Regulatory Actions in One or Multiple Jurisdictions:</h4>
            <p>The Resistance Platform could be impacted by one or more regulatory inquiries or regulatory actions, which could hinder or limit the ability of Resistance to continue to develop the Resistance Platform, or which could block or restrict the ability of a User to use the Resistance Platform.</p>
            <h4>Unendorsed, Alternative Resistance Networks</h4>
            <p>There is a possibility that alternative Resistance-based networks could be established, which utilize the same open-source source code and open-source protocol underlying the Resistance Platform. Resistance-based networks may compete with Resistance, which could potentially negatively impact the Resistance Platform.</p>
            <h4>Lack of Interest in the Resistance Platform or Distributed Applications</h4>
            <p>It is possible that the Resistance Platform will not be used by a significant number of external businesses, individuals, and other organizations and that there will be limited public interest in the creation and development of distributed applications. Such a lack of interest could impact the development of the Resistance Platform. It cannot predict the success of its development efforts or the efforts of other third-parties.</p>
            <h4>The Resistance Platform Does Not Meet User Expectations</h4>
            <p>The User recognizes that the Resistance Platform is under development and may undergo significant changes at any time. The User acknowledges that any expectations regarding the form and functionality of the Resistance Platform held by the User may not be met upon release of the Resistance Platform, for any number of reasons including a change in the design and implementation strategy and execution of the implementation of the Resistance Platform.</p>
            <h4>Potential Security Vulnerabilities</h4>
            <p>The Resistance Platform rests on open-source software, and there is a risk that Resistance or the Resistance Team, or other third-parties not directly affiliated with Resistance, may introduce weaknesses or bugs into the core infrastructural elements of the Resistance Platform causing the system to lose Resistance tokens stored in one or more User accounts or other accounts or lose sums of other valued tokens issued on the Resistance Platform.</p>
            <h4>Breakthroughs in Cryptography that Could be Used to Exploit the Resistance Platform</h4>
            <p>Cryptography is always advancing. Developments in code-breaking, quantum computing, AI and other fields, could jeopardize the security of cryptocurrencies and the Resistance Platform, which could result in the theft or loss of Resistance tokens. As much as possible, Resistance intends to update the protocol underlying the Resistance Platform to mitigate any advances in cryptography and to incorporate extra security measures, but it cannot guarantee that any security updates will be initiated in time or successfully.</p>
            <h4>Potential Mining Attacks</h4>
            <p>Just as is the case with many other cryptocurrencies, the blockchain used for the Resistance Platform is vulnerable to mining attacks, including but not limited to:</p>
              <ul>
                <li>Selfish-mining attacks</li>
                <li>Race condition attacks</li>
                <li>Double-spend attacks</li>
                <li>Majority mining power attacks</li>
              </ul>

            <p>Any successful attacks present a risk to the Resistance Platform, expected proper execution and sequencing of transactions, and expected adequate performance and sequencing of contract computations. Despite the efforts of Resistance and the Team, known or innovative mining attacks may be successful.</p>
            <h4>Quick Implementation and Inflated Demand</h4>
            <p>If the Resistance Platform is rapidly adopted, demand for Resistance tokens could increase intensely and at a pace that exceeds the rate at which miners can create new tokens. Under these circumstances, the entire Resistance Platform could become destabilized, due to the increased cost of running distributed applications. In turn, this could dampen interest in the Resistance Platform and Resistance tokens. Volatility in the demand for Resistance tokens could lead to an adverse change of the economic parameters of a Resistance-based business which could result in the company being unable to continue to operate economically, or to cease operation.</p>
            <h4>Quick Implementation and Insufficient Computational Application Processing Power</h4>
            <p>If the Resistance Platform is rapidly adopted, demand for transaction processing and distributed application computations could increase intensely and at a pace that exceeds the rate with which miners can bring online additional mining power. Under these circumstances, the entire Resistance Platform could become destabilized, due to the increased cost of running distributed applications. In turn, this could diminish interest in the Resistance Platform and Resistance tokens. Insufficiency of computational resources and an associated rise in the price of Resistance tokens could result in businesses being unable to acquire scarce computational resources to run their distributed applications. This would result in revenue losses to businesses or even cause businesses to cease operations because such operations will have become unprofitable.</p>
            <h4>Acknowledgment, acceptance of all risks and disclaimer of warranties and liabilities:</h4>
            <p>THE USER EXPRESSLY KNOWS AND AGREES THAT THE USER IS USING THE RESISTANCE PLATFORM AT THE USER&lsquo;S SOLE RISK. THE USER REPRESENTS THAT THE USER HAD AN ADEQUATE UNDERSTANDING OF THE RISKS, USAGES, AND INTRICACIES OF CRYPTOGRAPHIC TOKENS AND BLOCKCHAIN-BASED OPEN-SOURCE SOFTWARE, RESISTANCE, AND THE RESISTANCE COIN. THE USER ACKNOWLEDGES AND AGREES THAT, TO THE FULLEST EXTENT PERMITTED BY ANY APPLICABLE LAW, THE DISCLAIMERS OF LIABILITY CONTAINED HEREIN APPLY TO ANY AND ALL DAMAGES OR INJURY WHATSOEVER CAUSED BY OR RELATED TO RISKS OF, USE OF, OR INABILITY TO USE, THE RESISTANCE PLATFORM UNDER ANY CAUSE OF ACTION WHATSOEVER OF ANY KIND IN ANY JURISDICTION, INCLUDING, WITHOUT LIMITATION, ACTIONS FOR BREACH OF WARRANTY, BREACH OF CONTRACT OR TORT (INCLUDING NEGLIGENCE) AND THAT NEITHER RESISTANCE NOR THE RESISTANCE TEAM SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES, INCLUDING FOR LOSS OF PROFITS, GOODWILL OR DATA. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR CERTAIN TYPES OF DAMAGES. THEREFORE, SOME OF THE ABOVE LIMITATIONS IN THIS SECTION MAY NOT APPLY TO A USER. IN PARTICULAR, NOTHING IN THESE TERMS SHALL AFFECT THE STATUTORY RIGHTS OF ANY USER OR EXCLUDE INJURY ARISING FROM ANY WILLFUL MISCONDUCT OR FRAUD OF RESISTANCE.</p>
            <h4>Brief Network Incoherence</h4>
            <p>It is our recommendation that any groups handling large or essential transactions to maintain a voluntary 24-hour waiting period on any Resistance tokens deposited. In case the integrity of the network is at risk due to issues with the clients, we will aim to release patches with a sensible timeframe to address the issues. We will endeavor to provide solutions within the voluntary 24-hour waiting period.</p>
            <h4>Force Majeure</h4>

            Resistance is not liable for:
            <ul>
              <li>Government orders</li>
              <li>Lack of energy</li>
              <li>Unavoidable casualty</li>
              <li>Delays in delivery of materials</li>
              <li>Embargoes</li>
              <li>Acts of civil or military authorities</li>
            </ul>
            Any comparable unforeseen event that results in performance becoming commercially improbable.

            <h4>Tax Obligations</h4>
            Users are solely responsible to determine what, if any, taxes apply to transactions made with the Resistance coin or trades conducted through the Resistance decentralized exchange.
            The owners of, or contributors to, the Resistance platform are NOT responsible for determining the taxes that apply to transactions made with the Resistance coin or trades conducted through the Resistance decentralized exchange in any jurisdiction, anywhere in the world.
            Resistance does not condone, encourage or knowingly facilitate tax avoidance in any form, or in any jurisdiction.
          </div>

          <div className={styles.buttons}>
            <RoundedButton
              className={styles.disagree}
              onClick={() => toastr.info(t(`You must agree with the Terms and Conditions in order to use ResDEX.`))}
              disabled={!this.state.isScrolledToBottom}
              important
            >
              {t(`Disagree`)}
            </RoundedButton>

            <RoundedButton
              type="submit"
              className={styles.agree}
              onClick={this.props.actions.closeTermsAndConditionsModal}
              disabled={!this.state.isScrolledToBottom}
              important
            >
              {t(`Agree`)}
            </RoundedButton>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
	assets: state.resDex.assets,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ResDexLoginActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('resdex')(TermsAndConditionsModal))
