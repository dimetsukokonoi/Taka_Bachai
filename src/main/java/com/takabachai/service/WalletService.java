package com.takabachai.service;

import com.takabachai.exception.BadRequestException;
import com.takabachai.exception.ResourceNotFoundException;
import com.takabachai.model.Wallet;
import com.takabachai.repository.UserRepository;
import com.takabachai.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    public List<Wallet> getWalletsByUserId(Long userId) {
        return walletRepository.findByUserId(userId);
    }

    public Optional<Wallet> getWalletById(Long id) {
        return walletRepository.findById(id);
    }

    public Wallet createWallet(Wallet wallet) {
        if (wallet.getUserId() == null || !userRepository.existsById(wallet.getUserId())) {
            throw new BadRequestException("Invalid userId for wallet");
        }
        return walletRepository.save(wallet);
    }

    public Wallet updateWallet(Long id, Wallet walletData) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Wallet", id));
        wallet.setWalletName(walletData.getWalletName());
        wallet.setWalletType(walletData.getWalletType());
        wallet.setBalance(walletData.getBalance());
        if (walletData.getCurrency() != null && !walletData.getCurrency().isBlank()) {
            wallet.setCurrency(walletData.getCurrency());
        }
        return walletRepository.save(wallet);
    }

    public void deleteWallet(Long id) {
        if (!walletRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Wallet", id);
        }
        walletRepository.deleteById(id);
    }
}
