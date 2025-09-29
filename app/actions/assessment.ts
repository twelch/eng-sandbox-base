"use server";

// Assessment server action
export async function assessUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const forestlandAmount = formData.get('forestlandAmount') as string;
    const forestlandUnit = formData.get('forestlandUnit') as string;
    const treeSpecies = formData.getAll('treeSpecies') as string[];
    
    // Server-side validation
    if (!name) {
      return {
        success: false,
        error: 'Name is required'
      };
    }
    
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Valid email address is required'
      };
    }
    
    if (!forestlandAmount || isNaN(Number(forestlandAmount)) || Number(forestlandAmount) <= 0) {
      return {
        success: false,
        error: 'Valid forestland amount is required'
      };
    }
    
    if (!forestlandUnit || !['acres', 'square-miles'].includes(forestlandUnit)) {
      return {
        success: false,
        error: 'Valid forestland unit is required'
      };
    }
    
    if (!treeSpecies || treeSpecies.length === 0) {
      return {
        success: false,
        error: 'At least one tree species must be selected'
      };
    }
    
    // Simulate actual processing time (3 seconds)
    console.log(`Starting assessment for: ${name} (${email})`);
    console.log(`Forestland: ${forestlandAmount} ${forestlandUnit}`);
    console.log(`Tree species: ${treeSpecies.join(', ')}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate assessment results
    const results = {
      name,
      email,
      forestlandAmount: Number(forestlandAmount),
      forestlandUnit,
      treeSpecies,
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
