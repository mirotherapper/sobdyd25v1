import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import MCPConfig from '@/lib/db/models/MCPConfig';
import { auth } from '@clerk/nextjs/server';

// GET - Retrieve MCP configurations
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const version = searchParams.get('version');
    const name = searchParams.get('name');

    let query: any = {};

    if (active === 'true') {
      query.is_active = true;
    }

    if (version) {
      query.version = version;
    }

    if (name) {
      query.name = name;
    }

    const configs = await MCPConfig.find(query)
      .sort({ created_at: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: configs,
      count: configs.length,
    });
  } catch (error) {
    console.error('Error fetching MCP configurations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch MCP configurations',
      },
      { status: 500 }
    );
  }
}

// POST - Create new MCP configuration
export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin operations
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.version) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and version are required',
        },
        { status: 400 }
      );
    }

    // Check if configuration with same name already exists
    const existingConfig = await MCPConfig.findOne({ name: body.name });

    if (existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration with this name already exists',
        },
        { status: 409 }
      );
    }

    // Create new configuration
    const newConfig = new MCPConfig({
      ...body,
      created_by: userId,
    });

    await newConfig.save();

    return NextResponse.json(
      {
        success: true,
        data: newConfig,
        message: 'MCP configuration created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating MCP configuration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create MCP configuration',
      },
      { status: 500 }
    );
  }
}

// PUT - Update MCP configuration
export async function PUT(request: NextRequest) {
  try {
    // Check authentication for admin operations
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration ID is required',
        },
        { status: 400 }
      );
    }

    const config = await MCPConfig.findById(configId);

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration not found',
        },
        { status: 404 }
      );
    }

    // Update the configuration
    Object.assign(config, body);
    config.updated_at = new Date();

    await config.save();

    return NextResponse.json({
      success: true,
      data: config,
      message: 'MCP configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating MCP configuration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update MCP configuration',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete MCP configuration
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication for admin operations
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration ID is required',
        },
        { status: 400 }
      );
    }

    const config = await MCPConfig.findById(configId);

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration not found',
        },
        { status: 404 }
      );
    }

    await MCPConfig.findByIdAndDelete(configId);

    return NextResponse.json({
      success: true,
      message: 'MCP configuration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting MCP configuration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete MCP configuration',
      },
      { status: 500 }
    );
  }
}
