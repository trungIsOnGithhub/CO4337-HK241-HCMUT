import React from 'react';
import logoWeb from './assets/logoWeb.png';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { apiUserAcceptTermAndConditions } from 'apis/user';

const TermsAndConditions = () => {
  const {current} = useSelector(state => state.user)
  const handleAccept = async () => {
    const response = await apiUserAcceptTermAndConditions();

    if(response.success){
      Swal.fire({
        icon: 'success',
        title: 'Terms Accepted',
        text: 'You have successfully agreed to our Terms and Conditions.',
        confirmButtonColor: '#4299e1'
      });
    }
    else {
      Swal.fire('Error', 'Failed to accept Terms and Conditions.', 'error');
    }
  };
  return (
    <div className="bg-slate-500 min-h-screen text-white flex flex-col my-8">
      {/* Header */}
      <h1 className="ml-4 text-2xl font-bold py-3">Terms and Conditions</h1>
      <header className="bg-white text-black shadow-md">
        <div className="container mx-auto flex items-center p-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0">
            <img src={logoWeb}/>
          </div>
          <h4 className="ml-4 text-md font-bold">by BizServ - MDT441 - 26/12/2024</h4>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6 bg-white text-black rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Welcome to <strong>BizServ</strong></h2>
        <p className="mb-4">
          By accessing or using our Platform, you agree to these Terms. If you
          disagree, stop using Platform and contact our Support to Delete your Account.
        </p>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Role of the Platform</h3>
          <p className="mb-2">
            <strong>BizServ</strong> acts as an intermediary for transactions between
            Sellers and Buyers. We are not responsible for the quality,
            legality, or authenticity of goods listed.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Account Responsibilities</h3>
          <ul className="list-disc pl-5">
            <li>Be at least 18 years old or have legal capacity.</li>
            <li>Provide accurate account information.</li>
            <li>Maintain the confidentiality of account credentials.</li>
            <li>Dangerous, offensive, violent content is not allowed to be upload, post on BizServ.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Sellers</h3>
          <ul className="list-disc pl-5">
            <li>Comply with all laws and list accurate product, service, content information.</li>
            <li>Avoid prohibited items (see Prohibited Goods Policy).</li>
            <li>Fulfill orders promptly and manage refund/return policies.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Buyers</h3>
          <ul className="list-disc pl-5">
            <li>Review product details before purchasing.</li>
            <li>Pay promptly using the available payment methods.</li>
            <li>Resolve disputes with Sellers before seeking Platform assistance.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Fees and Payments</h3>
          <p>
            Sellers may pay fees as outlined in our Fee Policy. Payments are
            processed through third-party providers, and the Platform does not
            store payment details.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Transactions</h3>
          <p>
            Sellers are responsible for order, service fulfillment, shipping, and
            return/refund policies. Buyers must adhere to these policies and
            review terms before purchasing.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Prohibited Activities</h3>
          <p>
            Misuse of the Platform (fraud, spamming, circumventing fees) is
            prohibited. Sellers and Buyers must transact only through the
            Platform.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Limitation of Liability</h3>
          <p>
            <strong>BizServ</strong> is not liable for disputes or damages arising from
            transactions between users. The Platform is provided "as is"
            without warranties.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Termination</h3>
          <p>
            We may suspend or terminate accounts for violations of these Terms.
            Users may close their accounts by contacting [support email].
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
          <p>
            For questions, contact us at:
            <br />
            <strong>Email:</strong> [SUPPORT@BIZSERV.COM]
            <br />
            <strong>Phone:</strong> [0373015428]
            <br />
            <strong>Address:</strong> [Cơ sở Dĩ An – Khu đô thị Đại học Quốc Gia TP. HCM, Quận Thủ Đức, TP. HCM]
          </p>
        </section>
      </main>

      {
        (current && !current.acceptTAC) && (<div className="text-center mt-8">
          <button
            onClick={handleAccept}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
          >
            I Accepted Above Term and Conditions
          </button>
        </div>)
      }


      {/* Footer */}
      <footer className="bg-slate-500 text-center text-white p-4">
        &copy; 2024 [BizServ - CO4337 HK241 - HCMUT]. All rights reserved.
      </footer>
    </div>
  );
};

export default TermsAndConditions;