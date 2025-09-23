"use server";

// Assessment server action
export async function assessUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    
    if (!name) {
      return {
        success: false,
        error: 'Name is required'
      };
    }
    
    // Simulate actual processing time (3 seconds)
    console.log(`Starting assessment for: ${name}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate assessment results
    const results = {
      name,
      completedAt: new Date().toISOString(),
      processingTime: "3 seconds"
    };
    
    console.log(`Assessment completed for: ${name}`);
    
    return { 
      success: true, 
      data: results 
    };
  } catch (error) {
    console.error('Error assessing:', error);
    return { 
      success: false, 
      error: 'Assessment processing failed. Please try again.' 
    };
  }
}
