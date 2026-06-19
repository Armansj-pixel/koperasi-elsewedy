import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { SlipIndividu } from '@/lib/laporan/actions'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  headerRow: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#0f2d6b',
  },
  orgName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2d6b',
  },
  orgSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  docTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginTop: 10,
  },
  docPeriode: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2d6b',
    marginBottom: 8,
    marginTop: 4,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowLabel: {
    flex: 2,
    padding: 8,
    fontSize: 9,
    color: '#475569',
  },
  tableRowValue: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderTopWidth: 2,
    borderTopColor: '#0f2d6b',
  },
  totalLabel: {
    flex: 2,
    padding: 10,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2d6b',
  },
  totalValue: {
    flex: 1,
    padding: 10,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2d6b',
    textAlign: 'right',
  },
  noPinjamanBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  noPinjamanText: {
    fontSize: 9,
    color: '#15803d',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 160,
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 40,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  disclaimer: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 20,
    fontStyle: 'italic',
  },
})

function formatRupiah(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export default function SlipIndividuDocument({ slip }: { slip: SlipIndividu }) {
  return (
    <Document
      title={`Slip Potongan - ${slip.user.nama} - ${slip.periodeLabel}`}
      author="Koperasi Karyawan PT Elsewedy Electric Indonesia"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.orgName}>Koperasi Karyawan PT Elsewedy Electric Indonesia</Text>
          <Text style={styles.orgSub}>Slip Simpanan & Pinjaman Anggota</Text>
          <Text style={styles.docTitle}>Periode: {slip.periodeLabel}</Text>
          <Text style={styles.docPeriode}>
            Dicetak: {new Date(slip.tanggalCetak).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Info Anggota */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Anggota</Text>
            <Text style={styles.infoValue}>{slip.user.nama}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIK</Text>
            <Text style={styles.infoValue}>{slip.user.nik}</Text>
          </View>
          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <Text style={styles.infoLabel}>No HP</Text>
            <Text style={styles.infoValue}>{slip.user.no_hp ?? '-'}</Text>
          </View>
        </View>

        {/* Simpanan */}
        <Text style={styles.sectionTitle}>Rincian Simpanan</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableRowLabel}>Simpanan Wajib Bulan Ini</Text>
            <Text style={styles.tableRowValue}>{formatRupiah(slip.simpanan.wajib)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableRowLabel}>Simpanan Sukarela Bulan Ini</Text>
            <Text style={styles.tableRowValue}>{formatRupiah(slip.simpanan.sukarela)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.tableRowLabel}>Saldo Total Simpanan Saat Ini</Text>
            <Text style={styles.tableRowValue}>{formatRupiah(slip.simpanan.saldoTotal)}</Text>
          </View>
        </View>

        {/* Pinjaman */}
        <Text style={styles.sectionTitle}>Rincian Pinjaman</Text>
        {slip.pinjaman?.adaPinjamanAktif ? (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableRowLabel}>Nominal Pinjaman</Text>
              <Text style={styles.tableRowValue}>{formatRupiah(slip.pinjaman.nominalPinjaman)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableRowLabel}>Tenor</Text>
              <Text style={styles.tableRowValue}>{slip.pinjaman.tenorBulan} bulan</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableRowLabel}>Cicilan Ke</Text>
              <Text style={styles.tableRowValue}>
                {slip.pinjaman.cicilanKe > 0 ? `${slip.pinjaman.cicilanKe} dari ${slip.pinjaman.tenorBulan}` : '-'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableRowLabel}>Sisa Cicilan</Text>
              <Text style={styles.tableRowValue}>{slip.pinjaman.sisaCicilan} bulan</Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.tableRowLabel}>Potongan Cicilan Bulan Ini</Text>
              <Text style={styles.tableRowValue}>{formatRupiah(slip.pinjaman.cicilanBulanIni)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noPinjamanBox}>
            <Text style={styles.noPinjamanText}>Tidak ada pinjaman aktif pada periode ini.</Text>
          </View>
        )}

        {/* Total Potongan */}
        <View style={[styles.table, { marginTop: 4 }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL POTONGAN GAJI BULAN INI</Text>
            <Text style={styles.totalValue}>{formatRupiah(slip.totalPotonganBulanIni)}</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Slip ini dibuat otomatis oleh sistem dan sah tanpa tanda tangan basah. Untuk pertanyaan terkait potongan, hubungi pengurus koperasi.
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Mengetahui,</Text>
            <Text style={styles.signatureLine}>Bendahara Koperasi</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Anggota,</Text>
            <Text style={styles.signatureLine}>{slip.user.nama}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Koperasi Karyawan PT Elsewedy Electric Indonesia</Text>
          <Text>Dokumen ini bersifat rahasia</Text>
        </View>
      </Page>
    </Document>
  )
}
