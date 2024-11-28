const ADMIN_EMAIL_USERNAME_TEST_SUCCESS = "nvlong@outlook.com";
const ADMIN_PASSWORD_TEST_SUCCESS = "123";

const EMAIL_USERNAME_TEST_FAIL = "fail@mail.com";
const PASSWORD_TEST_FAIL = "123";

const CUSTOMER_EMAIL_USERNAME_TEST_SUCCESS = "trung.nguyen106@hcmut.edu.vn";
const CUSTOMER_PASSWORD_TEST_SUCCESS = "123";

const SP_AVATAR_IMAGE_PATH = 'cypress/fixtures/sp_avatar.jpg';
const EXAMPLE_IMAGE = 'cypress/fixtures/example.png';

const SAMPLE_STAFF_DATA = {
    firstName: 'Sample Name',
    lastName: 'Staff',
    email: 'samplename.staff@yahoo.com',
    mobile: '0808996699'
}

const SAMPLE_SP_REGISTER_DATA = {
    firstName: 'Provider Admin',
    lastName: 'Sample',
    email: 'nviettrung20@gmail.com',
    avatar: SP_AVATAR_IMAGE_PATH,
    images: null,
    mobile: '0808080899',
    password: '12345678',
    bussinessName: 'Sample Provider',
    addressFeed: '268 Ly Thuong Kiet',
}

module.exports = {
    ADMIN_EMAIL_USERNAME_TEST_SUCCESS,
    ADMIN_PASSWORD_TEST_SUCCESS,
    CUSTOMER_EMAIL_USERNAME_TEST_SUCCESS,
    CUSTOMER_PASSWORD_TEST_SUCCESS,
    EMAIL_USERNAME_TEST_FAIL,
    PASSWORD_TEST_FAIL,
    SAMPLE_STAFF_DATA,
    SAMPLE_SP_REGISTER_DATA,
    SP_AVATAR_IMAGE_PATH,
    EXAMPLE_IMAGE
}