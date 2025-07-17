import { useState } from 'react';
import { FormModal, FormModalWithActions, IframeModal } from '../ui/modals';
import {
    PencilIcon,
    UserIcon,
    DocumentTextIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Example component demonstrating the usage of FormModal components
 */
export function FormModalExamples() {
    const [showBasicForm, setShowBasicForm] = useState(false);
    const [showAdvancedForm, setShowAdvancedForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showLongForm, setShowLongForm] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [showIframeModal, setShowIframeModal] = useState(false);
    const [showIframeSmall, setShowIframeSmall] = useState(false);
    const [showIframeLarge, setShowIframeLarge] = useState(false);
    const [showIframeFullscreen, setShowIframeFullscreen] = useState(false);
    const [result, setResult] = useState<string>('');

    // Basic form example
    const handleBasicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        setResult(`Basic form submitted: ${JSON.stringify(data)}`);
        setShowBasicForm(false);
    };

    // Advanced form example
    const handleAdvancedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        setResult(`Advanced form submitted: ${JSON.stringify(data)}`);
        setShowAdvancedForm(false);
    };

    // User form example
    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        setResult(`User form submitted: ${JSON.stringify(data)}`);
        setShowUserForm(false);
    };

    // Long form example
    const handleLongSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        setResult(`Long form submitted: ${JSON.stringify(data)}`);
        setShowLongForm(false);
    };

    // Test modal example
    const handleTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        setResult(`Test modal submitted: ${JSON.stringify(data)}`);
        setShowTestModal(false);
    };

    return (
        <div className="p-8 space-y-4">
            <h2 className="text-2xl font-bold mb-6">FormModal Examples</h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Basic FormModal Example */}
                <button
                    onClick={() => setShowBasicForm(true)}
                    className="btn btn-primary"
                >
                    Show Basic Form Modal
                </button>

                {/* FormModalWithActions Example */}
                <button
                    onClick={() => setShowAdvancedForm(true)}
                    className="btn btn-secondary"
                >
                    Show Advanced Form Modal
                </button>

                {/* User Form Example */}
                <button
                    onClick={() => setShowUserForm(true)}
                    className="btn btn-accent"
                >
                    Show User Form Modal
                </button>

                {/* Long Form Example */}
                <button
                    onClick={() => setShowLongForm(true)}
                    className="btn btn-info"
                >
                    Show Long Form Modal
                </button>

                {/* Debug Long Form Example */}
                <button
                    onClick={() => setShowTestModal(true)}
                    className="btn btn-warning"
                >
                    Test Scrolling Modal
                </button>

                {/* Test Modal Example */}
                <button
                    onClick={() => setShowTestModal(true)}
                    className="btn btn-danger"
                >
                    Show Test Modal
                </button>

                {/* Iframe Modal Example */}
                <button
                    onClick={() => setShowIframeModal(true)}
                    className="btn btn-success"
                >
                    Show Iframe Modal
                </button>

                {/* Small Iframe Modal Example */}
                <button
                    onClick={() => setShowIframeSmall(true)}
                    className="btn btn-neutral"
                >
                    Small Iframe Modal
                </button>

                {/* Large Iframe Modal Example */}
                <button
                    onClick={() => setShowIframeLarge(true)}
                    className="btn btn-primary"
                >
                    Large Iframe Modal
                </button>

                {/* Fullscreen Iframe Modal Example */}
                <button
                    onClick={() => setShowIframeFullscreen(true)}
                    className="btn btn-error"
                >
                    Fullscreen Iframe Modal
                </button>
            </div>

            {/* Display result */}
            {result && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{result}</p>
                </div>
            )}

            {/* Basic FormModal - you manage form submission manually */}
            <FormModal
                isOpen={showBasicForm}
                onClose={() => setShowBasicForm(false)}
                title="Basic Form"
                icon={<DocumentTextIcon className="h-6 w-6" />}
                maxWidth="md"
            >
                <form onSubmit={handleBasicSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowBasicForm(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </FormModal>

            {/* Advanced FormModalWithActions - handles form submission and actions */}
            <FormModalWithActions
                isOpen={showAdvancedForm}
                onClose={() => setShowAdvancedForm(false)}
                onSubmit={handleAdvancedSubmit}
                title="Advanced Form"
                icon={<PencilIcon className="h-6 w-6" />}
                maxWidth="lg"
                submitText="Create Post"
                cancelText="Discard"
                submitButtonVariant="primary"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            name="title"
                            type="text"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter post title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter post description"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <textarea
                            name="content"
                            rows={8}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter post content"
                        />
                    </div>
                </div>
            </FormModalWithActions>

            {/* User Form Modal */}
            <FormModalWithActions
                isOpen={showUserForm}
                onClose={() => setShowUserForm(false)}
                onSubmit={handleUserSubmit}
                title="User Profile"
                icon={<UserIcon className="h-6 w-6" />}
                maxWidth="xl"
                submitText="Save Profile"
                cancelText="Cancel"
                submitButtonVariant="success"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Last name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            rows={4}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Tell us about yourself"
                        />
                    </div>
                </div>
            </FormModalWithActions>

            {/* Long Form Modal - demonstrates scrolling */}
            <FormModalWithActions
                isOpen={showLongForm}
                onClose={() => setShowLongForm(false)}
                onSubmit={handleLongSubmit}
                title="Long Form Example"
                icon={<InformationCircleIcon className="h-6 w-6" />}
                maxWidth="2xl"
                maxHeight="lg"
                submitText="Submit Application"
                cancelText="Cancel"
                submitButtonVariant="primary"
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800 text-sm">
                            This is a long form that demonstrates scrolling behavior in the modal.
                            The header and footer stay fixed while the content scrolls.
                        </p>
                    </div>

                    {/* Personal Information Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    name="dateOfBirth"
                                    type="date"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Street address, city, state, ZIP"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title
                                </label>
                                <input
                                    name="jobTitle"
                                    type="text"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                </label>
                                <input
                                    name="company"
                                    type="text"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Years of Experience
                                </label>
                                <select
                                    name="experience"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                >
                                    <option value="">Select...</option>
                                    <option value="0-1">0-1 years</option>
                                    <option value="2-5">2-5 years</option>
                                    <option value="6-10">6-10 years</option>
                                    <option value="11-15">11-15 years</option>
                                    <option value="16+">16+ years</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Skills
                                </label>
                                <textarea
                                    name="skills"
                                    rows={4}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="List your key skills and technologies"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Letter
                                </label>
                                <textarea
                                    name="coverLetter"
                                    rows={6}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Tell us why you're interested in this position"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Comments
                                </label>
                                <textarea
                                    name="comments"
                                    rows={4}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Any additional information you'd like to share"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <input
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                I agree to the terms and conditions
                            </label>
                        </div>
                    </div>
                </div>
            </FormModalWithActions>

            {/* Test Modal Example */}
            <FormModal
                isOpen={showTestModal}
                onClose={() => setShowTestModal(false)}
                title="Test Modal"
                icon={<DocumentTextIcon className="h-6 w-6" />}
                maxWidth="md"
            >
                <form onSubmit={handleTestSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Field 1
                        </label>
                        <input
                            name="testField1"
                            type="text"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter test value 1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Field 2
                        </label>
                        <input
                            name="testField2"
                            type="text"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter test value 2"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowTestModal(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </FormModal>

            {/* Test Scrolling Modal - simple test */}
            <FormModalWithActions
                isOpen={showTestModal}
                onClose={() => setShowTestModal(false)}
                onSubmit={handleTestSubmit}
                title="Test Scrolling"
                maxWidth="md"
                maxHeight="sm"
                submitText="Test Submit"
                cancelText="Test Cancel"
                submitButtonVariant="primary"
            >
                <div className="space-y-4">
                    <div className="bg-red-100 p-2 text-sm">Debug: Content area</div>
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Field {i + 1}
                            </label>
                            <input
                                name={`field${i + 1}`}
                                type="text"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder={`Enter value for field ${i + 1}`}
                            />
                        </div>
                    ))}
                    <div className="bg-blue-100 p-2 text-sm">Debug: End of content</div>
                </div>
            </FormModalWithActions>

            {/* Iframe Modal Examples */}
            <IframeModal
                isOpen={showIframeModal}
                onClose={() => setShowIframeModal(false)}
                title="Example Website"
                src="https://www.example.com"
                width="2xl"
                height="lg"
            />

            {/* Small Iframe Modal */}
            <IframeModal
                isOpen={showIframeSmall}
                onClose={() => setShowIframeSmall(false)}
                title="GitHub - Small Size"
                src="https://github.com"
                width="lg"
                height="lg"
            />

            {/* Large Iframe Modal */}
            <IframeModal
                isOpen={showIframeLarge}
                onClose={() => setShowIframeLarge(false)}
                title="MDN Web Docs - Large Size"
                src="https://developer.mozilla.org"
                width="5xl"
                height="5xl"
            />

            {/* Fullscreen Iframe Modal */}
            <IframeModal
                isOpen={showIframeFullscreen}
                onClose={() => setShowIframeFullscreen(false)}
                title="YouTube - Fullscreen"
                src="https://www.youtube.com"
                width="full"
                height="full"
                showTitle={true}
            />
        </div>
    );
}
