"use server";

import { revalidatePath } from "next/cache";

// This URL will be your deployed createOrganization function URL
const CREATE_ORGANIZATION_URL = process.env.CREATE_ORGANIZATION_FUNCTION_URL || '';

// This URL will be your deployed setOrganizationStatus function URL
const SET_ORGANIZATION_STATUS_URL = process.env.SET_ORGANIZATION_STATUS_FUNCTION_URL || '';


export async function createOrganizationAction(formData: FormData) {
  if (!CREATE_ORGANIZATION_URL) {
    return { success: false, message: "CREATE_ORGANIZATION_FUNCTION_URL is not configured." };
  }
  try {
    // In a real app, you'd get the token from the logged-in superadmin
    // const superadminToken = await auth.currentUser?.getIdToken();
    const superadminToken = "superadmin-dummy-token"; // Placeholder

    const response = await fetch(CREATE_ORGANIZATION_URL, {
      method: "POST",
      headers: {
        // 'Authorization': `Bearer ${superadminToken}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.details || 'Failed to create organization');
    }

    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, message: error.message || "An unknown error occurred." };
  }
}


export async function setOrganizationStatusAction(orgId: string, status: 'Active' | 'Suspended' | 'In Arrears') {
    if (!SET_ORGANIZATION_STATUS_URL) {
        return { success: false, message: "SET_ORGANIZATION_STATUS_FUNCTION_URL is not configured." };
    }
    // This is a mock implementation. In a real app, this would be a secured Cloud Function.
    console.log(`Calling function to set organization ${orgId} to ${status}`);
    
    // In a real app, you would make a fetch call to your cloud function:
    /*
    const response = await fetch(SET_ORGANIZATION_STATUS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${superadminToken}`
        },
        body: JSON.stringify({ organizationId: orgId, status: status })
    });

    if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.details || 'Failed to update status' };
    }
    */
   
    // Simulating API call latency
    await new Promise(resolve => setTimeout(resolve, 500));

    revalidatePath("/superadmin/dashboard");
    revalidatePath("/superadmin/organizations");
    
    return { success: true, message: `Organization status changed to ${status}` };
}
