import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createSubmission,
  getSubmissions,
  CreateSubmissionDto,
} from '../../../lib/services/api/submissionService';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  validateRequiredFields,
} from '../../../lib/utils/api-utils';

export async function POST(request: Request) {
  try {
    // ENFORCE AUTHENTICATION - No guest submissions allowed
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        'AuthenticationRequired',
        'You must be signed in to submit trax. No guest submissions allowed.',
        401
      );
    }

    const submissionData = await request.json();

    // Validate required fields
    const validation = validateRequiredFields(submissionData, [
      'url',
      'submissionType',
    ]);
    if (!validation.isValid) {
      return createErrorResponse(
        validation.error!.error,
        validation.error!.message,
        validation.error!.status,
        validation.error!.details
      );
    }

    // Verify the submitted user ID matches authenticated user
    if (!submissionData.submittedBy || submissionData.submittedBy !== userId) {
      return createErrorResponse(
        'AuthenticationMismatch',
        'Submission user ID must match authenticated user. No guest submissions allowed.',
        403
      );
    }

    // Prepare data for service
    const createData: CreateSubmissionDto = {
      url: submissionData.url,
      submissionType: submissionData.submissionType,
      submissionMessage: submissionData.submissionMessage,
      submittedBy: userId,
    };

    // Create submission using service
    const submission = await createSubmission(createData);

    return createSuccessResponse(
      {
        submissionId: submission._id,
        submission,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status') || 'pending';
    const submissionType = searchParams.get('submissionType') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get submissions using service
    const result = await getSubmissions({
      status,
      submissionType,
      submittedBy: userId,
      limit,
      skip,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
