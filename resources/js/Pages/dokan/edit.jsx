import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FaStore, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaImage, FaTrash, FaUpload, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { Transition } from '@headlessui/react';
import { useState } from 'react';

export default function EditDokan({ dokan, user }) {
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method: 'patch',
        name: dokan?.name || '',
        slug: dokan?.slug || '',
        phone: dokan?.phone || user?.phone || '',
        email: dokan?.email || user?.email || '',
        location: dokan?.location || '',
        description: dokan?.description || '',
        logo: null,
        remove_logo: false,
    });

    const [logoPreview, setLogoPreview] = useState(dokan?.logo_url || null);

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setData((prev) => ({
            ...prev,
            name: newName,
            slug: slugify(newName),
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                logo: file,
                remove_logo: false,
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setData((prev) => ({
            ...prev,
            logo: null,
            remove_logo: true,
        }));
        setLogoPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('dokan.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout header="Store Settings">
            <Head title="Store Settings" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between border-l-4 border-l-emerald-600">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaStore className="mr-3 text-emerald-600 text-2xl" /> Store Information & Branding
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage your store logo, name, URL slug, contact details, and location.
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-xs">
                        <form onSubmit={submit} className="space-y-6 max-w-2xl">
                            {/* Store Logo Section */}
                            <div>
                                <InputLabel value="Store Logo" />
                                <div className="mt-2 flex items-center gap-6">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center shadow-inner group">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Store Logo Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center p-2">
                                                <FaImage className="mx-auto text-2xl text-gray-400 mb-1" />
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">No Logo</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-lg border border-emerald-200 flex items-center transition-colors">
                                                <FaUpload className="mr-2 text-emerald-600" />
                                                {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                />
                                            </label>

                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-lg border border-rose-200 flex items-center transition-colors"
                                                >
                                                    <FaTrash className="mr-1.5 text-rose-500" /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, WEBP or SVG (Max 2MB). Displayed on receipts & price lists.
                                        </p>
                                    </div>
                                </div>
                                <InputError message={errors.logo} className="mt-2" />
                            </div>

                            {/* Store Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Store Name *" />
                                <div className="mt-1 relative rounded-md shadow-2xs">
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={handleNameChange}
                                        required
                                        placeholder="e.g. Subhadip General Store"
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Store URL Slug */}
                            <div>
                                <InputLabel htmlFor="slug" value="Store Price List URL Slug" />
                                <div className="mt-1 flex rounded-md shadow-2xs">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-mono">
                                        /
                                    </span>
                                    <TextInput
                                        id="slug"
                                        type="text"
                                        className="rounded-l-none block w-full text-xs font-mono"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="e.g. my-store-name"
                                    />
                                </div>
                                {data.slug && (
                                    <p className="text-xs text-emerald-700 font-mono mt-1.5 flex items-center">
                                        <FaInfoCircle className="mr-1 shrink-0" /> Public Link: <a href={route('dokans.price-list', { dokan: data.slug })} target="_blank" rel="noreferrer" className="underline ml-1 font-bold">{route('dokans.price-list', { dokan: data.slug })}</a>
                                    </p>
                                )}
                                <InputError message={errors.slug} className="mt-2" />
                            </div>

                            {/* Contact Phone & Email Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Phone Number */}
                                <div>
                                    <InputLabel htmlFor="phone" value="Store Contact Phone" />
                                    <div className="mt-1 relative rounded-md shadow-2xs">
                                        <TextInput
                                            id="phone"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="e.g. +91 9876543210"
                                        />
                                    </div>
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <InputLabel htmlFor="email" value="Store Contact Email" />
                                    <div className="mt-1 relative rounded-md shadow-2xs">
                                        <TextInput
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="e.g. store@example.com"
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                            </div>

                            {/* Location / Address */}
                            <div>
                                <InputLabel htmlFor="location" value="Store Location / Address" />
                                <div className="mt-1 relative rounded-md shadow-2xs">
                                    <TextInput
                                        id="location"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="e.g. Main Market, Station Road, Kolkata"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Full address displayed on printed price lists and invoice bills.
                                </p>
                                <InputError message={errors.location} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="Store Description" />
                                <textarea
                                    id="description"
                                    rows="3"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-2xs text-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief note or description about your store business..."
                                ></textarea>
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <PrimaryButton disabled={processing} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700">
                                    Save Store Settings
                                </PrimaryButton>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-emerald-600 font-bold flex items-center">
                                        <FaCheck className="mr-1.5" /> Saved successfully!
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
