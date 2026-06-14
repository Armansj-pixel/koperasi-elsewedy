import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const supabaseAdmin = createServiceClient();

    const NIK = "99999999";
    const PASSWORD = "9999";
    const EMAIL = `${NIK}@koperasi.local`;

    // 1. Hash password dengan bcrypt (fresh hash)
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // 2. Cek apakah user ada di tabel users
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, nik, nama, role")
      .eq("nik", NIK)
      .single();

    if (userError || !dbUser) {
      // Buat user baru kalau belum ada
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          nik: NIK,
          nama: "Super Admin",
          email: EMAIL,
          password_hash: passwordHash,
          must_change_password: true,
          role: "SUPERADMIN",
          is_active: true,
        });

      if (insertError) {
        return NextResponse.json(
          { success: false, step: "insert_user", error: insertError.message },
          { status: 500 }
        );
      }
    } else {
      // Update password hash kalau user sudah ada
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          password_hash: passwordHash,
          must_change_password: true,
          updated_at: new Date().toISOString(),
        })
        .eq("nik", NIK);

      if (updateError) {
        return NextResponse.json(
          { success: false, step: "update_password", error: updateError.message },
          { status: 500 }
        );
      }
    }

    // 3. Ambil user terbaru dari DB
    const { data: freshUser } = await supabaseAdmin
      .from("users")
      .select("id, nik, nama, role")
      .eq("nik", NIK)
      .single();

    // 4. Cek apakah user Supabase Auth sudah ada
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users.find((u) => u.email === EMAIL);

    // 5. Hapus user Auth lama kalau ada
    if (existingAuthUser) {
      await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
    }

    // 6. Buat user Supabase Auth baru
    const { data: newAuthUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          nik: NIK,
          nama: freshUser?.nama || "Super Admin",
          role: freshUser?.role || "SUPERADMIN",
          db_user_id: freshUser?.id,
        },
      });

    if (authError) {
      return NextResponse.json(
        { success: false, step: "create_auth_user", error: authError.message },
        { status: 500 }
      );
    }

    // 7. Juga insert ke saldo_simpanan kalau belum ada
    await supabaseAdmin
      .from("saldo_simpanan")
      .upsert({ user_id: freshUser?.id, total_saldo: 0 });

    return NextResponse.json({
      success: true,
      message: "Setup superadmin berhasil!",
      loginInfo: {
        nik: NIK,
        password: PASSWORD,
        url: "/login",
      },
      dbUser: freshUser,
      authUser: {
        id: newAuthUser.user?.id,
        email: newAuthUser.user?.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
