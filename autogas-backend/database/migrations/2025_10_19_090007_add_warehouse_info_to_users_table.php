<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('balance', 10, 2)->default(0)->after('is_active');
            $table->string('warehouse_address', 500)->nullable()->after('balance');
            $table->integer('warehouse_capacity')->default(0)->after('warehouse_address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['balance', 'warehouse_address', 'warehouse_capacity']);
        });
    }
};