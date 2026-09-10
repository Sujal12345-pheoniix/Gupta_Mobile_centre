import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { AttendanceStatus } from '@prisma/client';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  /**
   * GET /api/v1/store/data
   * Fetches all products, customers, employees, movements, and sales from PostgreSQL
   */
  @Get('data')
  async getStoreData() {
    const data = await this.storeService.getStoreData();
    return { success: true, data };
  }

  /**
   * POST /api/v1/store/products
   */
  @Post('products')
  async createProduct(@Body() dto: any) {
    const data = await this.storeService.createProduct(dto);
    return { success: true, data };
  }

  /**
   * PATCH /api/v1/store/products/:id
   */
  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: any) {
    const data = await this.storeService.updateProduct(id, dto);
    return { success: true, data };
  }

  /**
   * DELETE /api/v1/store/products/:id
   */
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    const data = await this.storeService.deleteProduct(id);
    return { success: true, data };
  }

  /**
   * POST /api/v1/store/inventory/adjust
   */
  @Post('inventory/adjust')
  async adjustInventory(@Body() dto: any) {
    const data = await this.storeService.adjustInventory(dto);
    return { success: true, data };
  }

  /**
   * POST /api/v1/store/customers
   */
  @Post('customers')
  async createCustomer(@Body() dto: any) {
    const data = await this.storeService.createCustomer(dto);
    return { success: true, data };
  }

  /**
   * PATCH /api/v1/store/customers/:id
   */
  @Patch('customers/:id')
  async updateCustomer(@Param('id') id: string, @Body() dto: any) {
    const data = await this.storeService.updateCustomer(id, dto);
    return { success: true, data };
  }

  /**
   * DELETE /api/v1/store/customers/:id
   */
  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    const data = await this.storeService.deleteCustomer(id);
    return { success: true, data };
  }

  /**
   * POST /api/v1/store/employees
   */
  @Post('employees')
  async createEmployee(@Body() dto: any) {
    const data = await this.storeService.createEmployee(dto);
    return { success: true, data };
  }

  /**
   * PATCH /api/v1/store/employees/:id
   */
  @Patch('employees/:id')
  async updateEmployee(@Param('id') id: string, @Body() dto: any) {
    const data = await this.storeService.updateEmployee(id, dto);
    return { success: true, data };
  }

  /**
   * DELETE /api/v1/store/employees/:id
   */
  @Delete('employees/:id')
  async deleteEmployee(@Param('id') id: string) {
    const data = await this.storeService.deleteEmployee(id);
    return { success: true, data };
  }

  /**
   * POST /api/v1/store/employees/attendance
   */
  @Post('employees/attendance')
  async markAttendance(@Body() dto: { employeeId: string; status: AttendanceStatus }) {
    const data = await this.storeService.markAttendance(dto);
    return { success: true, data };
  }

  /**
   * POST /api/v1/store/sales
   */
  @Post('sales')
  async recordSale(@Body() dto: any) {
    const data = await this.storeService.recordSale(dto);
    return { success: true, data };
  }
}
